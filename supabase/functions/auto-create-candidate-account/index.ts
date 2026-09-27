import { getCorsHeaders } from "../_shared/cors.ts";

// The legacy endpoint created accounts with a phone number as the password
// and could overwrite an existing user's password. Applicants now use their
// private tracking code and create their own password through signup.
Deno.serve((req) => {
  const headers = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers });
  return new Response(JSON.stringify({ error: "This endpoint has been retired" }), {
    status: 410,
    headers: { ...headers, "Content-Type": "application/json" },
  });
});
