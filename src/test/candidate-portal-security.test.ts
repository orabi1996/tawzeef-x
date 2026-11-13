import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { webcrypto } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  getCandidatePortalTicketKey,
  issueCandidatePortalTicket,
  validateCandidatePortalTicket,
  PORTAL_TOKEN_TTL_MS,
} from "../../supabase/functions/_shared/candidatePortalTicket";

const fromRepo = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("Candidate portal security regression", () => {
  const edge = fromRepo("supabase/functions/candidate-portal/index.ts");
  const page = fromRepo("src/pages/CandidatePortal.tsx");
  const routes = fromRepo("src/App.tsx");

  it("requires a separately configured server-side signing secret and verified email", () => {
    expect(edge).toContain('Deno.env.get("CANDIDATE_PORTAL_SIGNING_SECRET")');
    expect(edge).toContain('getCandidatePortalTicketKey(signingSecret)');
    expect(edge).toContain('validateCandidatePortalTicket(body.token, key)');
    expect(edge).toContain('.eq("email", ticket.email)');
    expect(edge).toContain('.eq("tracking_code", ticket.trackingCode)');
    expect(edge).not.toContain("phoneStr.includes(");
    expect(edge).not.toContain("const secret = Deno.env.get");
  });

  it("sends protected links only via verified delivery address, not in public responses", () => {
    expect(edge).toContain('action === "request"');
    expect(edge).toContain('const magicLink = PORTAL_URL + "#access="');
    expect(edge).toContain("GENERIC_EMAIL_MESSAGE");
    expect(edge).toContain("send-email");
    expect(edge).not.toContain("trackingList");
    expect(edge).not.toContain('siteUrl = req.headers.get');
  });

  it("has no anonymous direct database fallback or unauthenticated profile updates", () => {
    expect(page).not.toContain('supabase.from(');
    expect(page).not.toContain("license_status:");
    expect(page).not.toContain("ETEC-9842145-SA");
    expect(page).toContain('action: "read"');
    expect(page).toContain('action: "request"');
    expect(page).toContain('cleanQuery.delete("access")');
    expect(page).toContain("location.hash");
  });

  it("uses centralized CORS rather than wildcard response headers", () => {
    expect(edge).toContain('getExtendedCorsHeaders(req)');
    expect(edge).not.toMatch(/["']Access-Control-Allow-Origin["']\s*:\s*["']\*["']/);
  });

  it("preserves both public candidate portal URLs", () => {
    expect(routes).toContain('<Route path="/portal" element={<CandidatePortal />} />');
    expect(routes).toContain('<Route path="/candidate-portal" element={<CandidatePortal />} />');
  });
});

describe("Encrypted short-lived candidate portal tokens", () => {
  beforeAll(() => {
    vi.stubGlobal("crypto", webcrypto);
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  const primarySecret = "tawzeefx-dev-test-secret-must-not-use-in-production-001";
  const unrelatedSecret = "tawzeefx-unrelated-secret-must-not-use-in-production-002";
  const now = Date.now();
  const payload = {
    email: "candidate@example.com",
    trackingCode: "TX-12345",
    expiresAt: now + PORTAL_TOKEN_TTL_MS,
  };

  it("roundtrips an encrypted token and preserves the recipient email binding", async () => {
    const key = await getCandidatePortalTicketKey(primarySecret);
    const token = await issueCandidatePortalTicket(payload, key);
    expect(token).not.toContain(payload.email);
    await expect(validateCandidatePortalTicket(token, key, now)).resolves.toEqual(payload);
  });

  it("rejects a token validated with another key", async () => {
    const key = await getCandidatePortalTicketKey(primarySecret);
    const unrelatedKey = await getCandidatePortalTicketKey(unrelatedSecret);
    const token = await issueCandidatePortalTicket(payload, key);
    await expect(validateCandidatePortalTicket(token, unrelatedKey, now)).resolves.toBeNull();
  });

  it("rejects tampered ciphertext", async () => {
    const key = await getCandidatePortalTicketKey(primarySecret);
    const token = await issueCandidatePortalTicket(payload, key);
    const first = token[0] === "A" ? "B" : "A";
    await expect(validateCandidatePortalTicket(first + token.slice(1), key, now)).resolves.toBeNull();
  });

  it("rejects expired and unreasonably far-future tokens", async () => {
    const key = await getCandidatePortalTicketKey(primarySecret);
    const token = await issueCandidatePortalTicket(payload, key);
    await expect(validateCandidatePortalTicket(token, key, now + PORTAL_TOKEN_TTL_MS + 1)).resolves.toBeNull();
    await expect(validateCandidatePortalTicket(token, key, now - 5000)).resolves.toBeNull();
  });

  it("rejects short secrets and invalid token encodings", async () => {
    await expect(getCandidatePortalTicketKey("short")).rejects.toThrow();
    const key = await getCandidatePortalTicketKey(primarySecret);
    await expect(validateCandidatePortalTicket("TX-12345", key)).resolves.toBeNull();
    await expect(validateCandidatePortalTicket(12345, key)).resolves.toBeNull();
  });

  it("uses a fresh random nonce for every token", async () => {
    const key = await getCandidatePortalTicketKey(primarySecret);
    const first = await issueCandidatePortalTicket(payload, key);
    const second = await issueCandidatePortalTicket(payload, key);
    expect(first).not.toEqual(second);
  });
});
