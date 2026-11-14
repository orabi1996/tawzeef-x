import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const createAccount = source("supabase/functions/auto-create-candidate-account/index.ts");
const config = source("supabase/config.toml");
const apply = source("src/pages/ApplyJob.tsx");
const successPage = source("src/components/apply/ApplySuccessPass.tsx");
const authPage = source("src/pages/Auth.tsx");

describe("P0 candidate identity hardening regressions", () => {
  it("requires service-role authorization even when a JWT is present", () => {
    expect(config).toContain("[functions.auto-create-candidate-account]\nverify_jwt = true");
    expect(createAccount).toContain("bearer !== serviceKey");
    expect(createAccount).toContain("return json({ error: \"Unauthorized\" }, 401)");
  });

  it("never resets or exposes an applicant password", () => {
    expect(createAccount).not.toContain("auth.admin.updateUserById");
    expect(createAccount).not.toContain("auth.admin.createUser");
    expect(createAccount).not.toContain("password: cleanPassword");
    expect(createAccount).not.toContain("password: password");
    expect(createAccount).not.toContain("listUsers()");
  });

  it("uses a server-only email invitation with least-privileged candidate role", () => {
    expect(createAccount).toContain("admin.auth.admin.inviteUserByEmail");
    expect(createAccount).toContain('account_type: "job_seeker"');
    expect(createAccount).toContain('role: "job_seeker"');
    expect(createAccount).not.toContain("targetRole");
  });

  it("does not invoke privileged account creation from a public apply form", () => {
    expect(apply).not.toContain('supabase.functions.invoke("auto-create-candidate-account"');
    expect(apply).toContain('supabase.from("applications").insert(payload)');
  });

  it("does not report application submission success after both insert attempts fail", () => {
    expect(apply).toContain('const { error: retryErr } = await supabase.from("applications").insert');
    expect(apply).toContain("if (retryErr) throw retryErr;");
    expect(apply).toContain('title: "تعذر إرسال طلب التوظيف"');
  });

  it("never describes a phone number as the applicant's login password", () => {
    expect(successPage).not.toContain("كلمة المرور المؤقتة:");
    expect(successPage).not.toContain("بيانات الدخول لبوابة المرشح:");
    expect(authPage).not.toContain("رقم جوالك ككلمة مرور");
    expect(authPage).toContain('href="/portal"');
  });

  it.todo("verify deployed Supabase RLS with isolated test companies and job seekers on staging");
});
