import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const fromRepo = (file: string) =>
  readFileSync(resolve(process.cwd(), file), "utf8");

describe("Candidate portal security regression", () => {
  const edge = fromRepo("supabase/functions/candidate-portal/index.ts");
  const page = fromRepo("src/pages/CandidatePortal.tsx");
  const routes = fromRepo("src/App.tsx");

  it("only displays candidate data with a time-limited encrypted email ticket", () => {
    expect(edge).toContain('action === "read"');
    expect(edge).toContain("validateTicket(body.token, key)");
    expect(edge).toContain("crypto.subtle.decrypt");
    expect(edge).toContain("ticket.expiresAt <= Date.now()");
    expect(edge).toContain('.eq("email", ticket.email)');
    expect(edge).toContain('.eq("tracking_code", ticket.trackingCode)');
    expect(edge).not.toContain('rawCode.replace(/[^0-9]/g');
    expect(edge).not.toContain("phoneStr.includes(");
  });

  it("sends a protected link to the email on record, never data in the request response", () => {
    expect(edge).toContain('action === "request"');
    expect(edge).toContain('const magicLink = PORTAL_URL + "?access="');
    expect(edge).toContain("GENERIC_EMAIL_MESSAGE");
    expect(edge).toContain("send-email");
    expect(edge).not.toContain("trackingList");
    expect(edge).not.toContain("siteUrl = req.headers.get");
  });

  it("has no anonymous direct database read or update fallback", () => {
    expect(page).not.toContain('supabase.from(');
    expect(page).not.toContain("license_status:");
    expect(page).not.toContain("ETEC-9842145-SA");
    expect(page).toContain('action: "read"');
    expect(page).toContain('action: "request"');
    expect(page).toContain('next.delete("access")');
  });

  it("does not use wildcard CORS for candidate portal", () => {
    expect(edge).toContain('getExtendedCorsHeaders(req)');
    expect(edge).not.toMatch(/["']Access-Control-Allow-Origin["']\s*:\s*["']\*["']/);
  });

  it("preserves both public candidate portal URLs", () => {
    expect(routes).toContain('<Route path="/portal" element={<CandidatePortal />} />');
    expect(routes).toContain('<Route path="/candidate-portal" element={<CandidatePortal />} />');
  });
});
