import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const anonRls = source("supabase/migrations/20261113000000_revoke_anonymous_candidate_tracking_reads.sql");
const tenantRls = source("supabase/migrations/20261113002000_restore_recruitment_tenant_isolation.sql");
const signup = source("supabase/migrations/20261113001000_secure_auth_signup_role_assignment.sql");
const createAccount = source("supabase/functions/auto-create-candidate-account/index.ts");
const config = source("supabase/config.toml");
const apply = source("src/pages/ApplyJob.tsx");
const successPage = source("src/components/apply/ApplySuccessPass.tsx");
const authPage = source("src/pages/Auth.tsx");

describe("P0 candidate identity and tenant data isolation regressions", () => {
  it("drops public SELECT-by-tracking-code policies and blocks anonymous reads", () => {
    expect(anonRls).toContain('DROP POLICY IF EXISTS "Public tracking code lookup candidates"');
    expect(anonRls).toContain('DROP POLICY IF EXISTS "Public tracking code lookup applications"');
    expect(anonRls.match(/AS RESTRICTIVE\s+FOR SELECT TO anon\s+USING \(false\)/g)).toHaveLength(2);
  });

  it("drops unrestricted authenticated SELECT and enforces company-based RLS", () => {
    expect(tenantRls).toContain('DROP POLICY IF EXISTS "Authenticated users access all candidates"');
    expect(tenantRls).toContain('DROP POLICY IF EXISTS "Authenticated users access all applications"');
    expect(tenantRls).toContain("public.has_company_access(company_id)");
    expect(tenantRls).toContain('CREATE POLICY "Candidates require company membership"');
    expect(tenantRls).toContain('CREATE POLICY "Application reads require company membership"');
    expect(tenantRls).toContain("AS RESTRICTIVE");
  });

  it("does not allow self-chosen metadata or similar-looking email to create admins", () => {
    expect(signup).not.toMatch(/NEW\.raw_user_meta_data\s*->>\s*'role'/);
    expect(signup).not.toMatch(/NEW\.email\s+LIKE/);
    expect(signup).toContain("FROM public.invitations");
    expect(signup).toContain("_role := _inv.role");
    expect(signup).toContain("'job_seeker'::public.app_role");
  });

  it("only permits trusted service invitations and never sets or exposes passwords", () => {
    expect(config).toContain("[functions.auto-create-candidate-account]\nverify_jwt = true");
    expect(createAccount).toContain("bearer !== serviceKey");
    expect(createAccount).toContain("admin.auth.admin.inviteUserByEmail");
    expect(createAccount).not.toContain("auth.admin.updateUserById");
    expect(createAccount).not.toContain("auth.admin.createUser");
    expect(createAccount).not.toContain("password: cleanPassword");
    expect(createAccount).not.toContain("password: password");
  });

  it("keeps application submission independent from privileged account creation", () => {
    expect(apply).not.toContain('supabase.functions.invoke("auto-create-candidate-account"');
    expect(apply).toContain('const { error: retryErr } = await supabase.from("applications").insert');
    expect(apply).toContain("if (retryErr) throw retryErr;");
    expect(apply).toContain('title: "تعذر إرسال طلب التوظيف"');
  });

  it("stops advertising the applicant phone number as an account password", () => {
    expect(successPage).not.toContain("كلمة المرور المؤقتة:");
    expect(successPage).not.toContain("بيانات الدخول لبوابة المرشح:");
    expect(authPage).not.toContain("رقم جوالك ككلمة مرور");
    expect(authPage).toContain('href="/portal"');
  });
});
