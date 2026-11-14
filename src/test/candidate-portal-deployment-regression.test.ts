import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (filename: string) => readFileSync(resolve(process.cwd(), filename), "utf8");

describe("Candidate portal production compatibility and privacy", () => {
  const edge = source("supabase/functions/candidate-portal/index.ts");
  const routes = source("src/App.tsx");
  const registry = source("src/lib/permissionsRegistry.ts");
  const apply = source("src/pages/ApplyJob.tsx");

  it("prevents caching private candidate information from the portal API", () => {
    expect(edge).toContain('"Cache-Control": "private, no-store"');
    expect(edge).toContain('"Referrer-Policy": "no-referrer"');
  });

  it("preserves authenticated license update functionality", () => {
    expect(edge).toContain('action === "updateCredentials"');
    expect(edge).toContain("auth.getUser(token)");
    expect(edge).toContain('eq("tracking_code", code)');
  });

  it("preserves mailbox-level cooldown before sending tracking emails", () => {
    expect(edge).toContain('supabase.rpc("allow_candidate_recovery"');
    expect(edge).toContain("SHA-256");
  });

  it("keeps 128-bit tracking references rather than guessable six-digit codes", () => {
    expect(edge).toContain('^TX-[0-9A-F]{32}$');
    expect(apply).toContain("crypto.randomUUID()");
    expect(apply).not.toContain("Math.floor(100000 + Math.random()");
  });

  it("preserves the canonical and older candidate portal links", () => {
    expect(routes).toContain('<Route path="/portal" element={<CandidatePortal />} />');
    expect(routes).toContain('<Route path="/candidate-portal" element={<CandidatePortal />} />');
    expect(registry).toContain('"/candidate-portal"');
  });
});
