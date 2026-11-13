import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getExtendedCorsHeaders } from "../_shared/cors.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rateLimiter.ts";

const PORTAL_URL = "https://www.tawzeefx.com/portal";
const PORTAL_TOKEN_TTL_MS = 15 * 60 * 1000;
const GENERIC_EMAIL_MESSAGE =
  "إذا كان البريد الإلكتروني مرتبطاً بطلب توظيف، فستصلك رسالة برابط آمن لمتابعة الطلب. الرابط صالح لمدة 15 دقيقة.";
const encoder = new TextEncoder();
const decoder = new TextDecoder();

interface PortalTicket {
  email: string;
  trackingCode: string | null;
  expiresAt: number;
}

const json = (payload: unknown, status: number, headers: Record<string, string>) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...headers,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, private",
      "Referrer-Policy": "no-referrer",
    },
  });

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array {
  if (!/^[a-zA-Z0-9_-]+$/.test(value) || value.length > 2048) {
    throw new Error("Invalid portal ticket");
  }
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

// The dedicated secret can be rotated independently. The Supabase service key is
// used as a server-side fallback so existing deployments can adopt this fix without
// introducing a new environment dependency. Neither key is exposed to the browser.
async function getTicketKey(serviceRoleKey: string): Promise<CryptoKey> {
  const secret = Deno.env.get("CANDIDATE_PORTAL_SIGNING_SECRET") || serviceRoleKey;
  if (secret.length < 32) throw new Error("Portal ticket secret is not configured securely");
  const keyBytes = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode("tawzeefx:candidate-portal:v1:" + secret),
  );
  return crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

async function issueTicket(ticket: PortalTicket, key: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(JSON.stringify(ticket)),
  );
  const bytes = new Uint8Array(iv.length + ciphertext.byteLength);
  bytes.set(iv, 0);
  bytes.set(new Uint8Array(ciphertext), iv.length);
  return toBase64Url(bytes);
}

async function validateTicket(rawToken: unknown, key: CryptoKey): Promise<PortalTicket | null> {
  if (typeof rawToken !== "string" || rawToken.length < 40 || rawToken.length > 2048) {
    return null;
  }
  try {
    const bytes = fromBase64Url(rawToken);
    if (bytes.byteLength < 29) return null;
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: bytes.slice(0, 12) },
      key,
      bytes.slice(12),
    );
    const ticket = JSON.parse(decoder.decode(plain)) as PortalTicket;
    if (
      typeof ticket.email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ticket.email) ||
      (ticket.trackingCode !== null && typeof ticket.trackingCode !== "string") ||
      !Number.isFinite(ticket.expiresAt) ||
      ticket.expiresAt <= Date.now() ||
      ticket.expiresAt > Date.now() + PORTAL_TOKEN_TTL_MS
    ) return null;
    return ticket;
  } catch {
    return null;
  }
}

serve(async (req) => {
  const corsHeaders = getExtendedCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405, corsHeaders);

  const { allowed } = checkRateLimit(req, 10, 60_000);
  if (!allowed) return rateLimitResponse({ ...corsHeaders, "Cache-Control": "no-store" });

  try {
    const requestText = await req.text();
    if (requestText.length > 4096) return json({ error: "Request too large" }, 413, corsHeaders);
    const body = JSON.parse(requestText) as Record<string, unknown>;
    const action = body.action;

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) throw new Error("Backend is not configured");

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const key = await getTicketKey(serviceRoleKey);

    if (action === "request") {
      const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
      const trackingCode = typeof body.trackingCode === "string"
        ? body.trackingCode.trim()
        : "";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || trackingCode.length > 128) {
        return json({ error: "يرجى إدخال بريد إلكتروني صحيح" }, 400, corsHeaders);
      }

      // No wildcard, substring, phone, or ID matching. Email ownership is
      // subsequently proved by receiving the time-limited access link.
      let candidateQuery = supabase.from("candidates").select("id").eq("email", email).limit(1);
      let applicationQuery = supabase.from("applications").select("id").eq("email", email).limit(1);
      if (trackingCode) {
        candidateQuery = candidateQuery.eq("tracking_code", trackingCode);
        applicationQuery = applicationQuery.eq("tracking_code", trackingCode);
      }
      const [{ data: candidateMatches, error: candidateError }, { data: applicationMatches, error: applicationError }] =
        await Promise.all([candidateQuery, applicationQuery]);
      if (candidateError || applicationError) {
        console.error("Candidate portal lookup unavailable", candidateError, applicationError);
        return json({ error: "تعذر إرسال رابط التحقق حالياً" }, 503, corsHeaders);
      }

      // Never reveal whether an email or tracking code exists.
      if ((candidateMatches?.length || 0) + (applicationMatches?.length || 0) > 0) {
        const ticket = await issueTicket({
          email,
          trackingCode: trackingCode || null,
          expiresAt: Date.now() + PORTAL_TOKEN_TTL_MS,
        }, key);
        const magicLink = PORTAL_URL + "?access=" + encodeURIComponent(ticket);
        const emailResult = await fetch(supabaseUrl + "/functions/v1/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + serviceRoleKey,
          },
          body: JSON.stringify({
            to: email,
            subject: "رابط آمن لمتابعة طلب التوظيف — Tawzeef-X",
            html: '<div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.8">' +
              "<h2>تأكيد متابعة طلب التوظيف</h2>" +
              "<p>لخصوصيتك، استخدم الرابط التالي لعرض حالة الطلب. تنتهي صلاحيته بعد 15 دقيقة.</p>" +
              '<p><a href="' + magicLink + '">عرض طلب التوظيف بأمان</a></p>' +
              "<p>إذا لم تطلب ذلك، يمكنك تجاهل هذه الرسالة.</p></div>",
          }),
        }).catch((error) => {
          console.error("Candidate portal email delivery failed", error);
          return null;
        });
        if (!emailResult?.ok) console.error("Candidate portal verification email was not delivered");
      }
      return json({ success: true, message: GENERIC_EMAIL_MESSAGE }, 200, corsHeaders);
    }

    if (action === "read") {
      const ticket = await validateTicket(body.token, key);
      if (!ticket) return json({ error: "الرابط غير صالح أو انتهت صلاحيته. اطلب رابطاً جديداً." }, 401, corsHeaders);

      let candidatesQuery = supabase.from("candidates")
        .select("id,name,role,stage,status,skills,created_at,tracking_code,job_id,email")
        .eq("email", ticket.email).limit(100);
      let applicationsQuery = supabase.from("applications")
        .select("id,name,specialty,status,skills,created_at,tracking_code,job_id,email")
        .eq("email", ticket.email).limit(100);
      if (ticket.trackingCode) {
        candidatesQuery = candidatesQuery.eq("tracking_code", ticket.trackingCode);
        applicationsQuery = applicationsQuery.eq("tracking_code", ticket.trackingCode);
      }
      const [{ data: candidates, error: candidateError }, { data: applications, error: applicationError }] =
        await Promise.all([candidatesQuery, applicationsQuery]);
      if (candidateError || applicationError) {
        console.error("Candidate portal read unavailable", candidateError, applicationError);
        return json({ error: "تعذر عرض الطلب حالياً" }, 503, corsHeaders);
      }

      const candidateRows = candidates || [];
      const applicationRows = applications || [];
      const jobIds = [...new Set([
        ...candidateRows.map((row) => row.job_id),
        ...applicationRows.map((row) => row.job_id),
      ].filter((id): id is string => typeof id === "string" && id.length > 0))];
      const jobTitles: Record<string, string> = {};
      if (jobIds.length) {
        const { data: jobs } = await supabase.from("jobs").select("id,title").in("id", jobIds);
        for (const job of jobs || []) jobTitles[job.id] = job.title;
      }

      const result = candidateRows.map((row) => ({
        id: row.id,
        name: row.name,
        role: row.role || "متقدم للوظيفة",
        stage: row.stage || "تقديم الطلب",
        status: row.status || "قيد المراجعة",
        skills: row.skills,
        trackingCode: row.tracking_code,
        appliedAt: row.created_at,
        jobTitle: (row.job_id && jobTitles[row.job_id]) || row.role || null,
        aiScore: null,
      }));
      // Only include application records not already represented by a candidate.
      for (const row of applicationRows) {
        if (candidateRows.some((candidate) =>
          candidate.id === row.id ||
          (candidate.job_id === row.job_id && candidate.email === row.email)
        )) continue;
        result.push({
          id: row.id,
          name: row.name,
          role: row.specialty || "متقدم للوظيفة",
          stage: "تقديم الطلب",
          status: row.status || "قيد المراجعة",
          skills: row.skills,
          trackingCode: row.tracking_code,
          appliedAt: row.created_at,
          jobTitle: (row.job_id && jobTitles[row.job_id]) || row.specialty || null,
          aiScore: null,
        });
      }
      return json({ candidates: result }, 200, corsHeaders);
    }
    return json({ error: "Invalid action" }, 400, corsHeaders);
  } catch (error) {
    console.error("Candidate portal request failed", error);
    return json({ error: "تعذر إتمام الطلب حالياً" }, 500, corsHeaders);
  }
});
