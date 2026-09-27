import { getExtendedCorsHeaders } from "../_shared/cors.ts";

// The public legacy endpoint returned a private tracking code to anyone who
// supplied an applicant email and job ID. Applicants receive their code when
// submitting and can recover it only through their own email inbox.
Deno.serve((req) => {
  const headers = getExtendedCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers });
  return new Response(JSON.stringify({ error: "This endpoint has been retired" }), {
    status: 410,
    headers: { ...headers, "Content-Type": "application/json" },
  });
});
