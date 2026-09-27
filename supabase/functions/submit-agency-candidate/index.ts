import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getExtendedCorsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const headers = { ...getExtendedCorsHeaders(req), "Content-Type": "application/json" };
  const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
  if (req.method === "OPTIONS") return new Response(null, { headers });
  if (req.method !== "POST") return reply({ error: "Method not allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "").trim();
  if (!token || token === anonKey || token === serviceKey || token === Deno.env.get("SUPABASE_PUBLISHABLE_KEY")) {
    return reply({ error: "Authentication required" }, 401);
  }
  const userClient = createClient(url, anonKey);
  const { data: { user }, error: authError } = await userClient.auth.getUser(token);
  if (authError || !user) return reply({ error: "Authentication required" }, 401);

  const admin = createClient(url, serviceKey);
  let insertedCandidateId: string | undefined;
  try {
    const { agencyId, name, email, phone, role, resumeUrl } = await req.json();
    if (typeof agencyId !== "string" || !/^[0-9a-f-]{36}$/i.test(agencyId) ||
        typeof name !== "string" || !name.trim() || name.length > 150 ||
        typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return reply({ error: "Candidate name, email and agency required" }, 400);
    }

    const { data: membership, error: memberError } = await admin.from("agency_members")
      .select("id").eq("user_id", user.id).eq("agency_id", agencyId).maybeSingle();
    if (memberError) throw memberError;
    if (!membership) return reply({ error: "Agency membership required" }, 403);
    const { data: agency, error: agencyError } = await admin.from("agencies")
      .select("status").eq("id", agencyId).maybeSingle();
    if (agencyError) throw agencyError;
    if (agency?.status !== "active") return reply({ error: "Agency is inactive" }, 403);

    const { data: assignments, error: assignmentsError } = await admin.from("agency_assignments")
      .select("company_id").eq("agency_id", agencyId).eq("scope", "company").eq("status", "active")
      .order("created_at", { ascending: true }).limit(1);
    if (assignmentsError) throw assignmentsError;
    const companyId = assignments?.[0]?.company_id;
    if (!companyId) return reply({ error: "No active company assignment" }, 403);
    const { data: company, error: companyError } = await admin.from("companies")
      .select("owner_user_id, status").eq("id", companyId).single();
    if (companyError) throw companyError;
    if (company.status !== "active" || !company.owner_user_id) return reply({ error: "Company is unavailable" }, 403);

    const filePath = typeof resumeUrl === "string" &&
      resumeUrl.startsWith(`agency_${user.id}/`) &&
      /^agency_[0-9a-f-]{36}\/[a-zA-Z0-9_.-]+\.(pdf|doc|docx)$/i.test(resumeUrl)
      ? resumeUrl : null;
    if (resumeUrl && !filePath) return reply({ error: "Invalid resume path" }, 400);

    const { data: candidate, error: insertError } = await admin.from("candidates").insert({
      user_id: company.owner_user_id,
      company_id: companyId,
      agency_id: agencyId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: typeof phone === "string" ? phone.trim().slice(0, 50) : null,
      role: typeof role === "string" && role.trim() ? role.trim().slice(0, 150) : "مرشح مكتب توظيف",
      resume_url: filePath,
      stage: "تقديم الطلب",
      status: "جديد",
      source: "مكتب التوظيف",
      tracking_code: `TX-${crypto.randomUUID().replace(/-/g, "").toUpperCase()}`,
    }).select("id").single();
    if (insertError) throw insertError;
    insertedCandidateId = candidate.id;

    const { error: linkError } = await admin.from("agency_assignments").insert({
      agency_id: agencyId, company_id: companyId, candidate_id: candidate.id,
      scope: "candidate", status: "active", assigned_by: user.id,
    });
    if (linkError) throw linkError;
    return reply({ success: true, candidateId: candidate.id });
  } catch (error) {
    if (insertedCandidateId) await admin.from("candidates").delete().eq("id", insertedCandidateId);
    console.error("submit-agency-candidate:", error);
    return reply({ error: "Unable to submit candidate" }, 500);
  }
});
