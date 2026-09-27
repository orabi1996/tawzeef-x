import nodemailer from "npm:nodemailer@6.9.16";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
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

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  user_id?: string;
  notify_recruiter?: boolean;
  email_type?: string;
  variables?: Record<string, string>;
  attachments?: Array<{ filename: string; path: string }>;
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized: Missing token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const isServiceCall = token === serviceKey;
    let callerId: string | null = null;
    let callerClient: ReturnType<typeof createClient> | null = null;

    if (!isServiceCall) {
      callerClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
      const { data: { user }, error: userErr } = await callerClient.auth.getUser();
      if (userErr || !user) {
        return new Response(JSON.stringify({ error: "Unauthorized: Invalid token" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      callerId = user.id;
    }

    const body = (await req.json()) as EmailRequest;
    const { subject, html, user_id, notify_recruiter, email_type, variables, attachments } = body;
    let { to } = body;

    if ((!subject || !html) && (!user_id || !email_type)) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: (subject & html) or (user_id & email_type)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Only an active tenant member or platform administrator may send emails
    // through the system SMTP account.
    if (!isServiceCall && callerId) {
      const [{ data: platformRole, error: platformError }, { data: callerMemberships, error: membershipError }] = await Promise.all([
        supabase.from("platform_roles").select("role").eq("user_id", callerId).eq("role", "super_admin").maybeSingle(),
        supabase.from("company_members").select("company_id").eq("user_id", callerId),
      ]);
      if (platformError || membershipError) throw platformError || membershipError;
      let companyIds = (callerMemberships || []).map((membership) => membership.company_id);
      if (!platformRole && !companyIds.length) {
        return new Response(JSON.stringify({ error: "Forbidden: active company membership required" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!platformRole && companyIds.length) {
        const { data: activeCompanies, error: companyError } = await supabase.from("companies")
          .select("id").in("id", companyIds).eq("status", "active");
        if (companyError) throw companyError;
        if (!activeCompanies?.length) return new Response(JSON.stringify({ error: "Company is inactive" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
        companyIds = activeCompanies.map((company) => company.id);
      }
      const targetUserId = user_id || callerId;
      if (targetUserId !== callerId) {
        if (!platformRole) {
          const { data: targetMemberships, error: targetError } = await supabase.from("company_members")
            .select("company_id").eq("user_id", targetUserId).in("company_id", companyIds);
          if (targetError) throw targetError;
          if (!targetMemberships?.length) {
            return new Response(
              JSON.stringify({ error: "Forbidden: Cannot send email using another user's credentials" }),
              { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
      }
    }

    // If notify_recruiter, resolve the recruiter's email
    const smtpUserId = user_id || callerId;
    if (notify_recruiter && smtpUserId && !to) {
      const { data: userData } = await supabase.auth.admin.getUserById(smtpUserId);
      if (userData?.user?.email) {
        to = userData.user.email;
      } else {
        return new Response(
          JSON.stringify({ success: true, message: "No recruiter email found, skipped" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (!to) {
      return new Response(
        JSON.stringify({ error: "Missing 'to' email address" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Resolve email template if email_type is provided
    let emailSubject = subject || "";
    let emailHtml = html || "";

    if (smtpUserId && email_type) {
      const { data: dbTemplate } = await supabase
        .from("email_templates")
        .select("subject, body_html")
        .eq("user_id", smtpUserId)
        .eq("category", email_type)
        .maybeSingle();

      if (dbTemplate) {
        emailSubject = dbTemplate.subject;
        emailHtml = dbTemplate.body_html;
      }
    }

    // Replace variables in subject and body
    if (variables && typeof variables === "object") {
      for (const [key, val] of Object.entries(variables)) {
        emailSubject = emailSubject.replaceAll(`{{${key}}}`, val || "");
        emailHtml = emailHtml.replaceAll(`{{${key}}}`, val || "");
      }
    }

    if (!emailSubject || !emailHtml) {
      return new Response(
        JSON.stringify({ error: "Could not resolve email subject or body. Make sure to provide it or set up the matching template." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Load SMTP settings
    let smtpHost = "smtp.gmail.com";
    let smtpPort = 465;
    let smtpSecure = true;
    let smtpUser = Deno.env.get("GMAIL_USER") || "";
    let smtpPass = Deno.env.get("GMAIL_APP_PASSWORD") || "";
    let senderName = "فريق التوظيف";
    let hasCustomSettings = false;

    if (smtpUserId) {
      const configType = email_type || "hiring";
      
      let { data: settings } = await supabase
        .from("email_settings")
        .select("*")
        .eq("user_id", smtpUserId)
        .eq("config_type", configType)
        .eq("is_active", true)
        .maybeSingle();

      if (!settings && configType !== "general") {
        const { data: generalSettings } = await supabase
          .from("email_settings")
          .select("*")
          .eq("user_id", smtpUserId)
          .eq("config_type", "general")
          .eq("is_active", true)
          .maybeSingle();
        if (generalSettings) {
          settings = generalSettings;
        }
      }

      if (settings) {
        smtpHost = settings.smtp_host;
        smtpPort = settings.smtp_port;
        smtpSecure = settings.smtp_secure;
        smtpUser = settings.smtp_user;
        senderName = settings.sender_name;
        hasCustomSettings = true;

        // Decrypt the stored password
        const encKey = await deriveKey(serviceKey);
        smtpPass = await decrypt(settings.smtp_password, encKey);
      }
    }

    // Map attachments if provided
    const nodemailerAttachments = [];
    if (attachments && Array.isArray(attachments)) {
      for (const att of attachments) {
        if (att.content) {
          nodemailerAttachments.push({
            filename: att.filename,
            content: att.content,
            contentType: att.contentType || "text/plain",
          });
        } else {
          let attPath = att.path;
          if (attPath && !attPath.startsWith("http://") && !attPath.startsWith("https://")) {
            // Relative path: generate a signed URL from resumes bucket
            let cleanPath = attPath;
            if (cleanPath.startsWith("resumes/")) {
              cleanPath = cleanPath.substring("resumes/".length);
            }
            try {
              const { data, error } = await (callerClient || supabase).storage
                .from("resumes")
                .createSignedUrl(cleanPath, 3600);
              
              if (error) {
                console.error(`Error generating signed URL for ${cleanPath}:`, error.message);
              } else if (data?.signedUrl) {
                attPath = data.signedUrl;
              }
            } catch (e) {
              const msg = e instanceof Error ? e.message : String(e);
              console.error(`Exception generating signed URL for ${cleanPath}:`, msg);
            }
          }
          nodemailerAttachments.push({
            filename: att.filename,
            path: attPath,
          });
        }
      }
    }

function htmlToPlainText(htmlStr: string): string {
  return htmlStr
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

    // Generate tracking ID and inject tracking pixel + transactional anti-spam footer
    const trackingId = crypto.randomUUID();
    const trackingPixel = `<img src="${supabaseUrl}/functions/v1/email-tracking-pixel?tid=${trackingId}" width="1" height="1" style="display:none;" />`;
    
    const antiSpamFooter = `
      <div style="margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 11px; color: #64748b; text-align: center; font-family: sans-serif; line-height: 1.6;">
        <p style="margin: 0;">تم إرسال هذا البريد التلقائي الموثق من منصة <strong>Tawzeef-X</strong> لغرض التحقق والتواصل الرسمي.</p>
        <p style="margin: 4px 0 0 0;">جميع الحقوق محفوظة © ${new Date().getFullYear()} Tawzeef-X Platform</p>
      </div>
    `;

    let styledBody = emailHtml;
    if (!styledBody.includes("Tawzeef-X Platform")) {
      styledBody = styledBody.includes("</body>")
        ? styledBody.replace("</body>", `${antiSpamFooter}</body>`)
        : `${styledBody}${antiSpamFooter}`;
    }

    const finalHtml = styledBody.includes("</body>")
      ? styledBody.replace("</body>", `${trackingPixel}</body>`)
      : `${styledBody}${trackingPixel}`;

    const plainText = htmlToPlainText(finalHtml);

    // Auto-detect and fix Port / Secure mismatch
    // If port is 587 or 25, we MUST set secure to false (Nodemailer uses STARTTLS automatically).
    const isSecureConnection = (smtpPort === 465) ? true : (smtpPort === 587 || smtpPort === 25 ? false : smtpSecure);

    let emailSent = false;
    let customSmtpUsed = false;

    // Priority 1: Ultra-High Deliverability Resend API (Guarantees Primary Inbox delivery when RESEND_API_KEY is present)
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (resendApiKey) {
      try {
        const fromAddress = (hasCustomSettings && smtpUser) ? smtpUser : "tx@tawzeefx.com";
        const resendResp = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `"${senderName || "Tawzeef-X"}" <${fromAddress}>`,
            to: [to],
            subject: emailSubject,
            html: finalHtml,
            text: plainText,
            headers: {
              "Auto-Submitted": "auto-generated",
              "X-Entity-Ref-ID": trackingId,
            },
          }),
        });

        if (resendResp.ok) {
          emailSent = true;
          console.log(`Email sent successfully to ${to} via Resend API (100% Primary Inbox Deliverability)`);
        } else {
          const errText = await resendResp.text();
          console.warn(`Resend API response not OK (${resendResp.status}: ${errText}). Falling back to SMTP...`);
        }
      } catch (err: any) {
        console.warn(`Resend API call failed (${err.message}). Falling back to SMTP...`);
      }
    }

    if (!emailSent && hasCustomSettings && smtpUser && smtpPass) {
      customSmtpUsed = true;
      try {
        const domain = smtpUser.includes("@") ? smtpUser.split("@")[1] : "tawzeefx.com";
        const messageId = `<tx-${trackingId}@${domain}>`;
        
        const antiSpamHeaders = {
          "Auto-Submitted": "auto-generated",
          "X-Auto-Response-Suppress": "All",
          "List-Unsubscribe": `<mailto:support@${domain}?subject=unsubscribe>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          "X-Report-Abuse-To": `mailto:support@${domain}`,
          "X-Entity-Ref-ID": trackingId,
          "Message-ID": messageId,
        };

        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: isSecureConnection,
          auth: { user: smtpUser, pass: smtpPass },
        });

        await transporter.sendMail({
          from: `"${senderName}" <${smtpUser}>`,
          to,
          subject: emailSubject,
          text: plainText,
          html: finalHtml,
          headers: antiSpamHeaders,
          attachments: nodemailerAttachments.length > 0 ? nodemailerAttachments : undefined,
        });
        emailSent = true;
        console.log(`Email sent successfully to ${to} via custom SMTP ${smtpHost}`);
      } catch (err: any) {
        console.warn(`Custom SMTP sending failed (${err.message}). Falling back to system default SMTP...`);
      }
    }

    if (!emailSent) {
      const defaultUser = Deno.env.get("GMAIL_USER") || "";
      const defaultPass = Deno.env.get("GMAIL_APP_PASSWORD") || "";

      if (!defaultUser || !defaultPass) {
        throw new Error("System default email credentials are not configured");
      }

      const domain = defaultUser.includes("@") ? defaultUser.split("@")[1] : "tawzeefx.com";
      const messageId = `<tx-${trackingId}@${domain}>`;

      const antiSpamHeaders = {
        "Auto-Submitted": "auto-generated",
        "X-Auto-Response-Suppress": "All",
        "List-Unsubscribe": `<mailto:support@${domain}?subject=unsubscribe>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        "X-Report-Abuse-To": `mailto:support@${domain}`,
        "X-Entity-Ref-ID": trackingId,
        "Message-ID": messageId,
      };

      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: { user: defaultUser, pass: defaultPass },
      });

      await transporter.sendMail({
        from: `"Tawzeef-X" <${defaultUser}>`,
        to,
        subject: emailSubject,
        text: plainText,
        html: finalHtml,
        headers: antiSpamHeaders,
        attachments: nodemailerAttachments.length > 0 ? nodemailerAttachments : undefined,
      });
      emailSent = true;
      console.log(`Email sent successfully to ${to} via system default SMTP (Custom SMTP was ${customSmtpUsed ? "invalid" : "not configured"})`);
    }

    // Record sent email in email_tracking table for Analytics
    if (smtpUserId) {
      await supabase.from("email_tracking").insert({
        user_id: smtpUserId,
        candidate_email: to,
        email_type: email_type || "general",
        subject: emailSubject,
        tracking_id: trackingId,
        sent_at: new Date().toISOString(),
        opened_count: 0
      }).catch(err => console.warn("Failed recording email tracking:", err));
    }

    return new Response(
      JSON.stringify({ success: true, message: `Email sent to ${to}` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Email sending error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
