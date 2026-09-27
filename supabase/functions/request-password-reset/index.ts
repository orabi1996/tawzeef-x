import nodemailer from "npm:nodemailer@6.9.16";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, rateLimitResponse } from "../_shared/rateLimiter.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

const ALGO = "AES-GCM";

async function deriveKey(secret: string): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: new TextEncoder().encode(Deno.env.get("SMTP_ENCRYPTION_SALT") || "smtp-settings-tawzeefx-v2"), iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: ALGO, length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function decrypt(encoded: string, key: CryptoKey): Promise<string> {
  try {
    const combined = Uint8Array.from(atob(encoded), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    const decrypted = await crypto.subtle.decrypt({ name: ALGO, iv }, key, data);
    return new TextDecoder().decode(decrypted);
  } catch {
    // Legacy plain text fallback
    return encoded;
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function sha256(input: string) {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buffer)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  const json = (body: Record<string, unknown>, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    // Rate limit: 3 requests per minute per IP (email enumeration protection)
    const { allowed } = checkRateLimit(req, 3, 60_000);
    if (!allowed) return rateLimitResponse(corsHeaders);

  try {
    const { email } = await req.json();
    const normalizedEmail = normalizeEmail(String(email || ""));

    if (!normalizedEmail) return json({ error: "البريد الإلكتروني مطلوب" }, 400);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceKey);

    // Find user by email directly via public.get_user_by_email_v1 RPC
    const { data: dbUsers, error: findError } = await adminClient.rpc("get_user_by_email_v1", {
      email_input: normalizedEmail,
    });
    if (findError) throw findError;

    const targetUser = dbUsers && dbUsers.length > 0 ? dbUsers[0] : null;
    
    // To prevent email enumeration, return success even if user not found, but don't send email
    if (!targetUser) {
      console.log(`Password reset requested for non-existent email: ${normalizedEmail}`);
      return json({ success: true, message: "إذا كان البريد الإلكتروني مسجلاً لدينا، فستتلقى رابطاً لإعادة تعيين كلمة المرور." });
    }

    const userId = targetUser.id;
    const token = crypto.randomUUID();
    const tokenHash = await sha256(token);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

    // Invalidate previous reset tokens for this user
    await adminClient
      .from("password_reset_tokens")
      .update({ consumed_at: new Date().toISOString() })
      .eq("email", normalizedEmail)
      .eq("user_id", userId)
      .is("consumed_at", null);

    const { error: insertError } = await adminClient.from("password_reset_tokens").insert({
      user_id: userId,
      email: normalizedEmail,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });
    if (insertError) throw insertError;

    // Load SMTP settings
    let smtpHost = "smtp.gmail.com";
    let smtpPort = 465;
    let smtpSecure = true;
    let smtpUser = Deno.env.get("GMAIL_USER") || "";
    let smtpPass = Deno.env.get("GMAIL_APP_PASSWORD") || "";
    let senderName = "Tawzeef-X";

    // 1) Find user's direct email settings for password_reset, fallback to general
    let { data: settings } = await adminClient
      .from("email_settings")
      .select("*")
      .eq("user_id", userId)
      .eq("config_type", "password_reset")
      .eq("is_active", true)
      .maybeSingle();

    if (!settings) {
      const { data: generalSettings } = await adminClient
        .from("email_settings")
        .select("*")
        .eq("user_id", userId)
        .eq("config_type", "general")
        .eq("is_active", true)
        .maybeSingle();
      if (generalSettings) {
        settings = generalSettings;
      }
    }

    // 2) If not found, try to find settings of their company owner for password_reset or general
    if (!settings) {
      const { data: member } = await adminClient
        .from("company_members")
        .select("company_id")
        .eq("user_id", userId)
        .maybeSingle();
      
      if (member?.company_id) {
        const { data: ownerMember } = await adminClient
          .from("company_members")
          .select("user_id")
          .eq("company_id", member.company_id)
          .eq("member_role", "owner")
          .maybeSingle();
        
        if (ownerMember?.user_id) {
          let { data: ownerSettings } = await adminClient
            .from("email_settings")
            .select("*")
            .eq("user_id", ownerMember.user_id)
            .eq("config_type", "password_reset")
            .eq("is_active", true)
            .maybeSingle();
          
          if (!ownerSettings) {
            const { data: ownerGeneralSettings } = await adminClient
              .from("email_settings")
              .select("*")
              .eq("user_id", ownerMember.user_id)
              .eq("config_type", "general")
              .eq("is_active", true)
              .maybeSingle();
            if (ownerGeneralSettings) {
              ownerSettings = ownerGeneralSettings;
            }
          }

          if (ownerSettings) {
            settings = ownerSettings;
          }
        }
      }
    }

    // 3) Fallback to any active email settings in the database (global platform default fallback)
    if (!settings) {
      let { data: fallback } = await adminClient
        .from("email_settings")
        .select("*")
        .eq("config_type", "password_reset")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      if (!fallback) {
        const { data: generalFallback } = await adminClient
          .from("email_settings")
          .select("*")
          .eq("config_type", "general")
          .eq("is_active", true)
          .limit(1)
          .maybeSingle();
        if (generalFallback) {
          fallback = generalFallback;
        }
      }

      if (!fallback) {
        const { data: ultimateFallback } = await adminClient
          .from("email_settings")
          .select("*")
          .eq("is_active", true)
          .limit(1)
          .maybeSingle();
        if (ultimateFallback) {
          fallback = ultimateFallback;
        }
      }

      if (fallback) {
        settings = fallback;
      }
    }

    if (settings) {
      smtpHost = settings.smtp_host;
      smtpPort = settings.smtp_port;
      smtpSecure = settings.smtp_secure;
      smtpUser = settings.smtp_user;
      senderName = settings.sender_name || "Tawzeef-X";

      const encKey = await deriveKey(serviceKey);
      smtpPass = await decrypt(settings.smtp_password, encKey);
    }

    // Auto-detect and fix Port / Secure mismatch
    // If port is 587 or 25, we MUST set secure to false (Nodemailer uses STARTTLS automatically).
    const isSecureConnection = (smtpPort === 465) ? true : (smtpPort === 587 || smtpPort === 25 ? false : smtpSecure);

    const resetUrl = `${(Deno.env.get("APP_URL") || "https://www.tawzeefx.com").replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(normalizedEmail)}`;

    let emailSubject = "إعادة تعيين كلمة المرور - Tawzeef-X";
    let emailHtml = `
      <div style="margin:0;padding:32px 16px;background:#f6f8fb;font-family:Arial,sans-serif;direction:rtl;text-align:right;">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e7ecf3;border-radius:20px;padding:32px;box-shadow:0 10px 30px rgba(15,23,42,0.06);">
          <div style="display:inline-block;padding:8px 14px;border-radius:999px;background:#eff6ff;color:#1d4ed8;font-size:12px;font-weight:700;">استعادة الحساب</div>
          <h1 style="margin:18px 0 10px;color:#0f172a;font-size:28px;line-height:1.4;">طلب إعادة تعيين كلمة المرور</h1>
          <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.9;">لقد تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك في <strong>Tawzeef-X</strong>. انقر فوق الزر أدناه لتعيين كلمة مرور جديدة. صلاحية هذا الرابط 15 دقيقة.</p>
          <div style="margin:28px 0;text-align:center;">
            <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;border-radius:12px;background:#1d4ed8;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">إعادة تعيين كلمة المرور</a>
          </div>
          <p style="margin:0 0 20px;color:#64748b;font-size:13px;line-height:1.8;">إذا لم يعمل الزر، يمكنك نسخ الرابط التالي ولصقه في متصفحك:</p>
          <p style="margin:0 0 28px;color:#1d4ed8;font-size:13px;word-break:break-all;direction:ltr;text-align:left;">${resetUrl}</p>
          <p style="margin:0;color:#64748b;font-size:13px;line-height:1.8;">إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني بأمان.</p>
        </div>
      </div>
    `;

    const { data: dbTemplate } = await adminClient
      .from("email_templates")
      .select("subject, body_html")
      .eq("user_id", userId)
      .eq("category", "password_reset")
      .maybeSingle();

    if (dbTemplate) {
      emailSubject = dbTemplate.subject.replaceAll("{{reset_link}}", resetUrl);
      emailHtml = dbTemplate.body_html.replaceAll("{{reset_link}}", resetUrl);
    }

    let emailSent = false;
    let customSmtpUsed = false;

    if (settings && smtpUser && smtpPass) {
      customSmtpUsed = true;
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: isSecureConnection,
          auth: { user: smtpUser, pass: smtpPass },
        });

        await transporter.sendMail({
          from: `"${senderName}" <${smtpUser}>`,
          to: normalizedEmail,
          subject: emailSubject,
          html: emailHtml,
        });
        emailSent = true;
        console.log(`Password reset email sent to ${normalizedEmail} via custom SMTP: ${smtpHost}`);
      } catch (err: any) {
        console.warn(`Custom SMTP failed for password reset (${err.message}). Falling back to default system SMTP...`);
      }
    }

    if (!emailSent) {
      const defaultUser = Deno.env.get("GMAIL_USER") || "";
      const defaultPass = Deno.env.get("GMAIL_APP_PASSWORD") || "";

      if (!defaultUser || !defaultPass) {
        throw new Error("System default email credentials are not configured");
      }

      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: { user: defaultUser, pass: defaultPass },
      });

      await transporter.sendMail({
        from: `"Tawzeef-X" <${defaultUser}>`,
        to: normalizedEmail,
        subject: emailSubject,
        html: emailHtml,
      });
      emailSent = true;
      console.log(`Password reset email sent to ${normalizedEmail} via system default SMTP (Custom SMTP was ${customSmtpUsed ? "invalid" : "not configured"})`);
    }

    return json({ success: true, message: "إذا كان البريد الإلكتروني مسجلاً لدينا، فستتلقى رابطاً لإعادة تعيين كلمة المرور." });
  } catch (error: any) {
    console.error("request-password-reset error:", error);
    return json({ error: error.message || "حدث خطأ أثناء معالجة الطلب" }, 500);
  }
});
