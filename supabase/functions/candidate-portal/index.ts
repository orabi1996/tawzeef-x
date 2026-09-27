import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getExtendedCorsHeaders } from "../_shared/cors.ts";

const json = (body: unknown, status: number, headers: Record<string, string>) =>
  new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });

const escapeHtml = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (c) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[c]!));

Deno.serve(async (req) => {
  const corsHeaders = getExtendedCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405, corsHeaders);

  try {
    const { trackingCode, email, action, credentials } = await req.json();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    if (action === "updateCredentials") {
      const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "").trim();
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
      if (!token || token === anonKey || token === serviceKey || token === Deno.env.get("SUPABASE_PUBLISHABLE_KEY")) {
        return json({ error: "سجّل دخولك بالبريد المسجل في طلبك أولاً." }, 401, corsHeaders);
      }
      const authClient = createClient(supabaseUrl, anonKey);
      const { data: { user }, error: authError } = await authClient.auth.getUser(token);
      if (authError || !user?.email) return json({ error: "Authentication required" }, 401, corsHeaders);
      const code = typeof trackingCode === "string" ? trackingCode.trim().toUpperCase() : "";
      if (!/^TX-[0-9A-F]{32}$/.test(code) || !credentials || typeof credentials !== "object") {
        return json({ error: "Invalid credentials or tracking code" }, 400, corsHeaders);
      }
      const validEmail = user.email.toLowerCase();
      const [{ data: ownCandidates, error: candidateError }, { data: ownApplications, error: applicationError }] = await Promise.all([
        supabase.from("candidates").select("id").eq("tracking_code", code).ilike("email", validEmail).limit(2),
        supabase.from("applications").select("id").eq("tracking_code", code).ilike("email", validEmail).limit(2),
      ]);
      if (candidateError || applicationError) throw candidateError || applicationError;
      if (!ownCandidates?.length && !ownApplications?.length) return json({ error: "Forbidden" }, 403, corsHeaders);

      const fields = {
        license_number: String(credentials.licenseNumber || "").slice(0, 100),
        license_expiry: credentials.licenseExpiry && /^\d{4}-\d{2}-\d{2}$/.test(credentials.licenseExpiry)
          ? credentials.licenseExpiry : null,
        university_degree: String(credentials.universityDegree || "").slice(0, 200),
        demo_video_url: String(credentials.demoVideoUrl || "").slice(0, 1000),
      };
      for (const c of ownCandidates || []) {
        const { error } = await supabase.from("candidates").update(fields).eq("id", c.id);
        if (error) throw error;
      }
      for (const a of ownApplications || []) {
        const { error } = await supabase.from("applications").update(fields).eq("id", a.id);
        if (error) throw error;
      }
      // User-provided license details are saved, never marked as verified.
      return json({ success: true }, 200, corsHeaders);
    }

    if (typeof email === "string" && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail.length > 254 || !/^[^\s@%_]+@[^\s@%_]+\.[^\s@%_]+$/.test(cleanEmail)) {
        return json({ error: "Invalid email" }, 400, corsHeaders);
      }

      // Each mailbox has a server-side rate limit, even if the requester changes IP.
      const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(cleanEmail));
      const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
      const { data: maySend, error: limitError } = await supabase.rpc("allow_candidate_recovery", { p_request_hash: hash });
      if (limitError) throw limitError;

      if (maySend) {
        const [{ data: candidates, error: candError }, { data: applications, error: appError }] = await Promise.all([
          supabase.from("candidates").select("name, tracking_code, job_id, role").ilike("email", cleanEmail).limit(30),
          supabase.from("applications").select("name, tracking_code, job_id, specialty").ilike("email", cleanEmail).limit(30),
        ]);
        if (candError || appError) throw candError || appError;

        const byCode = new Map<string, { name: string; code: string; role: string }>();
        for (const c of candidates || []) {
          if (c.tracking_code) byCode.set(c.tracking_code, { name: c.name, code: c.tracking_code, role: c.role || "" });
        }
        for (const a of applications || []) {
          if (a.tracking_code && !byCode.has(a.tracking_code)) {
            byCode.set(a.tracking_code, { name: a.name, code: a.tracking_code, role: a.specialty || "" });
          }
        }

        if (byCode.size) {
          // Do not trust the request's Origin when building links in an email.
          const siteUrl = (Deno.env.get("APP_URL") || "https://www.tawzeefx.com").replace(/\/$/, "");
          const rows = [...byCode.values()].map((c) =>
            `<li>${escapeHtml(c.role)}: <code>${escapeHtml(c.code)}</code> ` +
            `<a href="${escapeHtml(siteUrl)}/portal?code=${encodeURIComponent(c.code)}">متابعة الطلب</a></li>`
          ).join("");
          const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}` },
            body: JSON.stringify({
              to: cleanEmail,
              subject: "رموز تتبع طلبات التوظيف الخاصة بك — Tawzeef-X",
              html: `<div dir="rtl"><p>مرحباً ${escapeHtml(byCode.values().next().value?.name)}</p><p>رموز متابعة طلباتك:</p><ul>${rows}</ul></div>`,
            }),
          });
          if (!response.ok) console.error("Candidate recovery email failed:", response.status);
        }
      }
      // Always give the same response whether the email exists or was rate limited.
      return json({ success: true, message: "إذا كان البريد مسجلاً، ستصلك رسالة تحتوي على رموز التتبع.", candidates: [] }, 200, corsHeaders);
    }

    if (typeof trackingCode !== "string") return json({ error: "Tracking code required" }, 400, corsHeaders);
    const code = trackingCode.trim().toUpperCase();
    // Codes were rotated to 128-bit random values in the accompanying migration.
    if (!/^TX-[0-9A-F]{32}$/.test(code)) {
      return json({ error: "رمز تتبع غير صالح. يمكنك استرجاع الرمز الجديد عبر البريد الإلكتروني." }, 400, corsHeaders);
    }

    // Exact indexed lookup only: never load whole tables or match names, phones or partial IDs.
    const [{ data: candidates, error: candError }, { data: applications, error: appError }] = await Promise.all([
      supabase.from("candidates").select("id, name, role, stage, status, skills, created_at, tracking_code, job_id, license_number, license_expiry, university_degree, demo_video_url")
        .eq("tracking_code", code).limit(2),
      supabase.from("applications").select("id, name, specialty, status, skills, created_at, tracking_code, job_id, license_number, license_expiry, university_degree, demo_video_url")
        .eq("tracking_code", code).limit(2),
    ]);
    if (candError || appError) throw candError || appError;

    const matches = [
      ...(candidates || []).map((c) => ({
        id: c.id, name: c.name, role: c.role || "متقدم للوظيفة", stage: c.stage || "تقديم الطلب",
        status: c.status || "قيد المراجعة", skills: c.skills, trackingCode: c.tracking_code,
        appliedAt: c.created_at, jobId: c.job_id, licenseNumber: c.license_number,
        licenseExpiry: c.license_expiry, universityDegree: c.university_degree, demoVideoUrl: c.demo_video_url,
      })),
      ...(applications || []).filter((a) => !(candidates || []).some((c) =>
        c.id === a.id || (c.tracking_code && c.tracking_code === a.tracking_code)
      )).map((a) => ({
        id: a.id, name: a.name, role: a.specialty || "متقدم للوظيفة", stage: "تقديم الطلب",
        status: a.status || "قيد المراجعة", skills: a.skills, trackingCode: a.tracking_code,
        appliedAt: a.created_at, jobId: a.job_id, licenseNumber: a.license_number,
        licenseExpiry: a.license_expiry, universityDegree: a.university_degree, demoVideoUrl: a.demo_video_url,
      })),
    ];
    if (!matches.length) return json({ error: "لم يتم العثور على طلب بهذا الرمز." }, 404, corsHeaders);

    const jobIds = [...new Set(matches.map((c) => c.jobId).filter(Boolean))];
    const { data: jobs, error: jobsError } = jobIds.length
      ? await supabase.from("jobs").select("id, title").in("id", jobIds)
      : { data: [], error: null };
    if (jobsError) throw jobsError;
    const titles = new Map((jobs || []).map((j) => [j.id, j.title]));
    return json({ candidates: matches.map(({ jobId, ...c }) => ({ ...c, jobTitle: titles.get(jobId) || c.role, aiScore: null })) }, 200, corsHeaders);
  } catch (error) {
    console.error("candidate-portal:", error);
    return json({ error: "Unable to load the application" }, 500, corsHeaders);
  }
});
