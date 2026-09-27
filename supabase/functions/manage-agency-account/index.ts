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

  const authClient = createClient(url, anonKey);
  const { data: { user }, error: authError } = await authClient.auth.getUser(token);
  if (authError || !user) return reply({ error: "Authentication required" }, 401);

  const admin = createClient(url, serviceKey);
  let invitedUserId: string | undefined;
  let createdAgencyId: string | undefined;
  try {
    const body = await req.json();
    const { action, companyId, agencyId } = body;
    if (typeof companyId !== "string" || !/^[0-9a-f-]{36}$/i.test(companyId) || !["create", "update", "remove"].includes(action)) {
      return reply({ error: "Invalid company or action" }, 400);
    }

    const [{ data: membership, error: memberError }, { data: role, error: roleError }] = await Promise.all([
      admin.from("company_members").select("member_role").eq("company_id", companyId).eq("user_id", user.id).maybeSingle(),
      admin.from("platform_roles").select("role").eq("user_id", user.id).eq("role", "super_admin").maybeSingle(),
    ]);
    if (memberError || roleError) throw memberError || roleError;
    if (membership?.member_role !== "owner" && !role) return reply({ error: "Company owner access required" }, 403);

    const { data: company, error: companyError } = await admin.from("companies")
      .select("id, status").eq("id", companyId).maybeSingle();
    if (companyError) throw companyError;
    if (!company || company.status !== "active") return reply({ error: "Company is not active" }, 403);

    if (action === "remove") {
      if (typeof agencyId !== "string" || !/^[0-9a-f-]{36}$/i.test(agencyId)) return reply({ error: "Invalid agency" }, 400);
      const { data: assignment, error: lookupError } = await admin.from("agency_assignments")
        .select("id").eq("agency_id", agencyId).eq("company_id", companyId).maybeSingle();
      if (lookupError) throw lookupError;
      if (!assignment) return reply({ error: "Agency is not assigned to your company" }, 403);
      const { error: removeError } = await admin.from("agency_assignments").delete().eq("id", assignment.id);
      if (removeError) throw removeError;
      // The agency may work with other companies; only remove this assignment.
      return reply({ success: true });
    }

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    if (!name || name.length > 150 || (action === "create" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
      return reply({ error: "Valid agency name and email required" }, 400);
    }
    const notes = String(body.notes || "").replace(/\[PASS:[^\]]*\]/gi, "").trim().slice(0, 2000);
    const data = {
      name,
      contact_phone: String(body.phone || "").slice(0, 50),
      country: String(body.country || "").slice(0, 100),
      city: String(body.city || "").slice(0, 100),
      license_number: String(body.licenseNumber || "").slice(0, 100),
      notes,
    };

    if (action === "update") {
      if (typeof agencyId !== "string" || !/^[0-9a-f-]{36}$/i.test(agencyId)) return reply({ error: "Invalid agency" }, 400);
      const { data: assignment, error: assignmentError } = await admin.from("agency_assignments")
        .select("id").eq("agency_id", agencyId).eq("company_id", companyId).maybeSingle();
      if (assignmentError) throw assignmentError;
      if (!assignment) return reply({ error: "Agency is not assigned to your company" }, 403);
      const { error: updateError } = await admin.from("agencies").update({ ...data, status: body.status === "inactive" ? "inactive" : "active" })
        .eq("id", agencyId);
      if (updateError) throw updateError;
      return reply({ success: true });
    }

    // An email invitation lets the recipient choose their own password. Never
    // overwrite an existing Auth user or store a password in agency notes.
    const { data: invitation, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${(Deno.env.get("APP_URL") || "https://www.tawzeefx.com").replace(/\/$/, "")}/reset-password?invite=agency`,
      data: { full_name: name, user_type: "agency", role: "recruiter" },
    });
    if (inviteError || !invitation.user) return reply({ error: inviteError?.message || "Invitation could not be sent" }, 400);
    invitedUserId = invitation.user.id;

    const { data: agency, error: agencyError } = await admin.from("agencies").insert({
      ...data, contact_email: email, owner_user_id: invitedUserId, status: "active",
    }).select("id").single();
    if (agencyError) throw agencyError;
    createdAgencyId = agency.id;

    const { error: assignmentError } = await admin.from("agency_assignments").insert({
      agency_id: agency.id, company_id: companyId, scope: "company", status: "active", assigned_by: user.id,
    });
    if (assignmentError) throw assignmentError;
    const { error: agencyMemberError } = await admin.from("agency_members").insert({
      agency_id: agency.id, user_id: invitedUserId, member_role: "owner", invited_by: user.id,
    });
    if (agencyMemberError) throw agencyMemberError;

    return reply({ success: true, agencyId: agency.id, email });
  } catch (error) {
    if (createdAgencyId) await admin.from("agencies").delete().eq("id", createdAgencyId);
    if (invitedUserId) await admin.auth.admin.deleteUser(invitedUserId);
    console.error("manage-agency-account:", error);
    return reply({ error: "Unable to save agency account" }, 500);
  }
});
