import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

// P0: Never create or reset passwords from an applicant's phone number.
// This function is only for trusted service-to-service invitations.
// The public job application process writes the application and uses
// the email-verified candidate portal; it must never invoke this endpoint.
Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  const json = (body: Record<string, unknown>, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const bearer = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");

  // Having a valid anon or ordinary user JWT is NOT enough: privileged
  // auth.admin operations are only available to a trusted backend worker.
  if (!serviceKey || !supabaseUrl || bearer !== serviceKey) {
    return json({ error: "Unauthorized" }, 401);
  }

  try {
    const body = await req.json() as Record<string, unknown>;
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 200) : "";

    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: "Invalid email" }, 400);
    }

    const admin = createClient(supabaseUrl, serviceKey);
    // Invite rather than setting a server-known password. The invited person
    // establishes their own credentials via Supabase's emailed auth flow.
    // Ignore caller-supplied role, account type, password, and phone fields.
    const { error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: name || email.split("@")[0],
        account_type: "job_seeker",
        role: "job_seeker",
      },
    });
    if (error) {
      console.error("Candidate secure invitation failed:", error.message);
      return json({ error: "Could not send candidate invitation" }, 409);
    }
    return json({ success: true, invitation_sent: true });
  } catch (error) {
    console.error("Candidate invitation request failed", error);
    return json({ error: "Unable to complete invitation" }, 500);
  }
});
