/**
 * Central Permissions Registry for Tawzeef-X
 * 
 * Implements Deny-by-Default architecture (PROMPT 03):
 * 1. Every route in App.tsx MUST be registered either in PUBLIC_ROUTES, CANDIDATE_ROUTES,
 *    PLATFORM_ADMIN_ROUTES, or SCREEN_PERMISSIONS.
 * 2. Any unregistered route is DENIED by default.
 * 3. Any missing role permission row is DENIED by default.
 * 4. Any query error in fetching permissions evaluates to DENIED (fail-closed).
 */

import type { AppRole } from "@/hooks/useUserRole";

export interface PermissionRow {
  permission_key: string;
  description: string;
  admin: boolean;
  recruiter: boolean;
  reviewer: boolean;
}

export interface GranularPermissionRow {
  role_key: string;
  user_id: string | null;
  module_key: string;
  can_read: boolean;
}

// Only registered, tenant-protected screens can be restricted by the company matrix.
// Public portals and platform administration are deliberately outside its scope.
export const GRANULAR_SCREEN_MODULES: Record<string, string> = {
  "screen.jobs": "jobs",
  "screen.candidates": "candidates",
  "screen.pipeline": "pipeline",
  "screen.talent_pool": "talent_pool",
  "screen.resume_archive": "resume_archive",
  "screen.interviews": "interviews",
  "screen.offers": "offers",
  "screen.ai_assistant": "ai_assistant",
  "screen.question_bank": "question_bank",
  "screen.reports": "reports",
  "screen.evaluation": "performance_evaluation",
  "screen.hiring_plan": "hiring_plan",
  "screen.team": "team",
  "screen.settings": "settings",
  "screen.tutorial": "tutorial",
  "screen.audit_log": "audit_log",
  "screen.company_agencies": "agencies",
};

export function isGranularScreenDenied(
  pathname: string,
  role: AppRole | null,
  userId: string | undefined,
  rows: GranularPermissionRow[],
): boolean {
  const config = getRoutePermissionConfig(pathname)?.config;
  const moduleKey = config && GRANULAR_SCREEN_MODULES[config.key];
  if (!moduleKey || !role || !userId) return false;
  const own = rows.find(row => row.module_key === moduleKey && row.user_id === userId && row.role_key === `user:${userId}`);
  const assigned = rows.find(row => row.module_key === moduleKey && row.user_id === null && row.role_key === role);
  return (own ?? assigned)?.can_read === false;
}

/**
 * Public routes that do not require authentication or tenant authorization
 */
export const PUBLIC_ROUTES: readonly string[] = [
  "/",
  "/auth",
  "/careers",
  "/pricing",
  "/forgot-password",
  "/reset-password",
  "/apply/:id",
  "/portal",
  "/candidate-portal",
  "/book/:candidateId",
  "/offer/:token",
  "/onboard/:orderId",
  "/install",
  "/meeting/:roomId",
  "/assessment/:token",
  "/about",
  "/features",
  "/contact",
  "/blog",
  "/blog/:slug",
  "/privacy",
  "/terms",
  "/typography",
  "/invitation/:token",
] as const;

/**
 * Routes exclusively reserved for Platform Super Admins (in platform_roles table).
 * Tenant Admins CANNOT access these under any circumstances.
 */
export const PLATFORM_ADMIN_ROUTES: readonly string[] = [
  "/roadmap",
  "/admin/blog",
  "/admin/companies",
  "/admin/companies/:id",
  "/admin/agencies",
  "/admin/quality",
] as const;

/**
 * Routes accessible by authenticated job seekers / candidates
 */
export const CANDIDATE_ROUTES: readonly string[] = [
  "/onboarding",
  "/seeker-dashboard",
  "/applicant-dashboard",
  "/company-registration",
] as const;

/**
 * Screen permissions mapping protected application screens to DB permission keys
 */
export const SCREEN_PERMISSIONS: Record<string, { key: string; description: string; defaultAllowed: AppRole[] }> = {
  "/dashboard": {
    key: "screen.dashboard",
    description: "لوحة التحكم الرئيسية",
    defaultAllowed: ["admin", "recruiter", "reviewer"],
  },
  "/jobs": {
    key: "screen.jobs",
    description: "إدارة الوظائف",
    defaultAllowed: ["admin", "recruiter", "reviewer"],
  },
  "/jobs/:id": {
    key: "screen.jobs",
    description: "تفاصيل الوظيفة",
    defaultAllowed: ["admin", "recruiter", "reviewer"],
  },
  "/candidates": {
    key: "screen.candidates",
    description: "إدارة المرشحين",
    defaultAllowed: ["admin", "recruiter", "reviewer"],
  },
  "/candidates/:id": {
    key: "screen.candidates",
    description: "ملف المرشح",
    defaultAllowed: ["admin", "recruiter", "reviewer"],
  },
  "/ai-assistant": {
    key: "screen.ai_assistant",
    description: "مساعد الذكاء الاصطناعي",
    defaultAllowed: ["admin", "recruiter", "reviewer"],
  },
  "/ai-tools": {
    key: "screen.ai_assistant",
    description: "أدوات التوظيف الذكية",
    defaultAllowed: ["admin", "recruiter"],
  },
  "/reports": {
    key: "screen.reports",
    description: "التقارير والإحصائيات",
    defaultAllowed: ["admin", "recruiter", "reviewer"],
  },
  "/interviews": {
    key: "screen.interviews",
    description: "جدولة وإدارة المقابلات",
    defaultAllowed: ["admin", "recruiter", "reviewer"],
  },
  "/notifications": {
    key: "screen.notifications",
    description: "مركز التنبيهات والإشعارات",
    defaultAllowed: ["admin", "recruiter", "reviewer"],
  },
  "/pipeline": {
    key: "screen.pipeline",
    description: "مراحل مسار التوظيف (Pipeline)",
    defaultAllowed: ["admin", "recruiter", "reviewer"],
  },
  "/offers": {
    key: "screen.offers",
    description: "العروض الوظيفية الرقمية",
    defaultAllowed: ["admin", "recruiter", "reviewer"],
  },
  "/converted-orders": {
    key: "screen.converted_orders",
    description: "طلبات التوظيف المحوّلة",
    defaultAllowed: ["admin", "recruiter", "reviewer"],
  },
  "/hiring-plan": {
    key: "screen.hiring_plan",
    description: "خطة وميزانية التوظيف",
    defaultAllowed: ["admin", "recruiter"],
  },
  "/settings": {
    key: "screen.settings",
    description: "إعدادات الشركة والملف الشخصي",
    defaultAllowed: ["admin", "recruiter", "reviewer"],
  },
  "/tutorial": {
    key: "screen.tutorial",
    description: "دليل الاستخدام والتعليمات",
    defaultAllowed: ["admin", "recruiter", "reviewer"],
  },
  "/guide": {
    key: "screen.tutorial",
    description: "دليل الاستخدام",
    defaultAllowed: ["admin", "recruiter", "reviewer"],
  },
  "/system-guide": {
    key: "screen.tutorial",
    description: "دليل النظام",
    defaultAllowed: ["admin", "recruiter", "reviewer"],
  },
  "/help": {
    key: "screen.tutorial",
    description: "المساعدة والدعم",
    defaultAllowed: ["admin", "recruiter", "reviewer"],
  },
  "/talent-pool": {
    key: "screen.talent_pool",
    description: "بنك المواهب والكفاءات",
    defaultAllowed: ["admin", "recruiter", "reviewer"],
  },
  "/tasks": {
    key: "screen.tasks",
    description: "لوحة المهام",
    defaultAllowed: ["admin", "recruiter", "reviewer"],
  },
  "/task-board": {
    key: "screen.tasks",
    description: "لوحة المهام والأنشطة",
    defaultAllowed: ["admin", "recruiter", "reviewer"],
  },
  "/evaluation/manual": {
    key: "screen.evaluation",
    description: "سجل التقييم اليدوي",
    defaultAllowed: ["admin", "recruiter", "reviewer"],
  },
  "/evaluation/cycles": {
    key: "screen.evaluation",
    description: "تقييم الأداء",
    defaultAllowed: ["admin", "recruiter", "reviewer"],
  },

  "/evaluation": {
    key: "screen.evaluation",
    description: "تقييم الأداء",
    defaultAllowed: ["admin", "recruiter", "reviewer"],
  },
  "/performance-evaluation": {
    key: "screen.evaluation",
    description: "تقييم أداء فريق التوظيف",
    defaultAllowed: ["admin", "recruiter", "reviewer"],
  },
  "/question-bank": {
    key: "screen.question_bank",
    description: "بنك الأسئلة والتقييمات",
    defaultAllowed: ["admin", "recruiter"],
  },
  "/library": {
    key: "screen.library",
    description: "مكتبة النظام والنماذج",
    defaultAllowed: ["admin", "recruiter", "reviewer"],
  },
  "/system-library": {
    key: "screen.library",
    description: "مكتبة النظام والنماذج",
    defaultAllowed: ["admin", "recruiter", "reviewer"],
  },
  "/resume-archive": {
    key: "screen.resume_archive",
    description: "أرشيف السير الذاتية",
    defaultAllowed: ["admin", "recruiter", "reviewer"],
  },
  "/workflow": {
    key: "screen.workflow",
    description: "محرر مسارات العمل والأتمتة",
    defaultAllowed: ["admin", "recruiter"],
  },
  "/checklist-tracker": {
    key: "screen.checklist_tracker",
    description: "متتبع قوائم الفحص والتحقق",
    defaultAllowed: ["admin", "recruiter"],
  },
  "/team": {
    key: "screen.team",
    description: "إدارة أعضاء الفريق والأدوار",
    defaultAllowed: ["admin"],
  },
  "/audit-log": {
    key: "screen.audit_log",
    description: "سجل التدقيق والعمليات الأمنية",
    defaultAllowed: ["admin", "recruiter"],
  },
  "/company": {
    key: "screen.company_portal",
    description: "بوابة الشركة والفروع",
    defaultAllowed: ["admin", "recruiter"],
  },
  "/company/agencies": {
    key: "screen.company_agencies",
    description: "إدارة وكالات التوظيف الشريكة",
    defaultAllowed: ["admin", "recruiter"],
  },
  "/agency": {
    key: "screen.agency_portal",
    description: "بوابة الوكالة التوظيفية",
    defaultAllowed: ["admin", "recruiter"],
  },
};

/**
 * Action permissions for sensitive operations
 */
export const ACTION_PERMISSIONS: Record<string, { key: string; description: string; superAdminOnly?: boolean; tenantAdminOnly?: boolean }> = {
  "action.company.delete": {
    key: "action.company.delete",
    description: "حذف شركة نهائياً",
    superAdminOnly: true,
  },
  "action.company.dry_run": {
    key: "action.company.dry_run",
    description: "معاينة إحصائيات حذف الشركة قبل التنفيذ",
    superAdminOnly: true,
  },
  "action.company.create_branch": {
    key: "action.company.create_branch",
    description: "إنشاء فرع جديد للشركة",
    tenantAdminOnly: true,
  },
  "action.roles.update": {
    key: "action.roles.update",
    description: "تعديل صلاحيات وأدوار أعضاء الفريق",
    tenantAdminOnly: true,
  },
  "action.users.invite": {
    key: "action.users.invite",
    description: "دعوة عضو جديد لفريق العمل",
    tenantAdminOnly: true,
  },
  "action.edit_jobs": {
    key: "action.edit_jobs",
    description: "تعديل الوظائف",
  },
  "action.delete_jobs": {
    key: "action.delete_jobs",
    description: "حذف إعلان وظيفي",
    tenantAdminOnly: true,
  },
  "action.edit_candidates": {
    key: "action.edit_candidates",
    description: "تعديل بيانات المرشحين",
  },
  "action.candidates.delete": {
    key: "action.candidates.delete",
    description: "حذف مرشح",
    tenantAdminOnly: true,
  },
  "action.create_interviews": {
    key: "action.create_interviews",
    description: "جدولة مقابلة",
  },
  "action.edit_interviews": {
    key: "action.edit_interviews",
    description: "تعديل وتقييم المقابلات",
  },
  "action.google_indexing.submit": {
    key: "action.google_indexing.submit",
    description: "طلب أرشفة وظيفة عبر Google Indexing API",
  },
};

/**
 * Match dynamic route patterns like /jobs/:id or /blog/:slug
 */
export function matchRoutePattern(pattern: string, pathname: string): boolean {
  if (pattern === pathname) return true;
  const patternSegments = pattern.split("/").filter(Boolean);
  const pathSegments = pathname.split("/").filter(Boolean);

  if (patternSegments.length !== pathSegments.length) return false;

  return patternSegments.every((seg, i) => {
    if (seg.startsWith(":")) return true;
    return seg === pathSegments[i];
  });
}

/**
 * Check if a path is in PUBLIC_ROUTES
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(pattern => matchRoutePattern(pattern, pathname));
}

/**
 * Check if a path is in PLATFORM_ADMIN_ROUTES
 */
export function isPlatformAdminRoute(pathname: string): boolean {
  return PLATFORM_ADMIN_ROUTES.some(pattern => matchRoutePattern(pattern, pathname));
}

/**
 * Check if a path is in CANDIDATE_ROUTES
 */
export function isCandidateRoute(pathname: string): boolean {
  return CANDIDATE_ROUTES.some(pattern => matchRoutePattern(pattern, pathname));
}

/**
 * Get permission key for a given route. Returns null if route not found.
 */
export function getRoutePermissionConfig(pathname: string): { pattern: string; config: (typeof SCREEN_PERMISSIONS)[string] } | null {
  for (const [pattern, config] of Object.entries(SCREEN_PERMISSIONS)) {
    if (matchRoutePattern(pattern, pathname)) {
      return { pattern, config };
    }
  }
  return null;
}

/**
 * DENY-BY-DEFAULT Core Access Evaluator:
 * - Public routes -> ALLOW
 * - Platform Admin routes -> ALLOW ONLY IF isPlatformSuperAdmin
 * - Candidate routes -> ALLOW if candidate or tenant member
 * - If route is unregistered -> DENY
 * - If permissions query is loading or errored -> DENY
 * - If user role is null/unauthenticated -> DENY
 * - If permission row exists in DB -> use DB value
 * - If permission row missing in DB -> use safe defaultAllowed or DENY
 */
export function evaluateScreenAccess(params: {
  pathname: string;
  role: AppRole | null;
  isPlatformSuperAdmin: boolean;
  isCandidate?: boolean;
  permissions?: PermissionRow[] | null;
  isLoading?: boolean;
  isError?: boolean;
}): boolean {
  const { pathname, role, isPlatformSuperAdmin, isCandidate, permissions, isLoading, isError } = params;

  // 1. Fail closed on error or loading
  if (isLoading || isError) return false;

  // 2. Public routes are accessible to all
  if (isPublicRoute(pathname)) return true;

  // 3. Platform Admin routes require verified Platform Super Admin
  if (isPlatformAdminRoute(pathname)) {
    return isPlatformSuperAdmin === true;
  }

  // 4. Platform Super Admin has access to all tenant screens as auditor/supervisor
  if (isPlatformSuperAdmin) {
    return true;
  }

  // 5. Candidate portal routes
  if (isCandidateRoute(pathname)) {
    return isCandidate === true || role === "job_seeker" || role !== null;
  }

  // 6. If user is unauthenticated or role is missing -> DENY
  if (!role) return false;

  // 7. Check if route is registered in SCREEN_PERMISSIONS
  const match = getRoutePermissionConfig(pathname);
  if (!match) {
    // UNKNOWN ROUTE -> DENY BY DEFAULT
    return false;
  }

  const { config } = match;

  // 8. If DB permissions table is provided, look up row
  if (permissions && Array.isArray(permissions)) {
    const dbRow = permissions.find(p => p.permission_key === config.key);
    if (dbRow) {
      if (role === "admin") return dbRow.admin ?? false;
      if (role === "recruiter") return dbRow.recruiter ?? false;
      if (role === "reviewer") return dbRow.reviewer ?? false;
      return false;
    }
  }

  // 9. Fallback to strict code-level defaultAllowed if DB row not found
  return config.defaultAllowed.includes(role);
}

/**
 * DENY-BY-DEFAULT Core Action Evaluator
 */
export function evaluateActionPermission(params: {
  actionKey: string;
  role: AppRole | null;
  isPlatformSuperAdmin: boolean;
  permissions?: PermissionRow[] | null;
}): boolean {
  const { actionKey, role, isPlatformSuperAdmin, permissions } = params;

  const actionConfig = ACTION_PERMISSIONS[actionKey];
  if (!actionConfig) {
    // UNKNOWN ACTION -> DENY BY DEFAULT
    return false;
  }

  if (actionConfig.superAdminOnly) {
    return isPlatformSuperAdmin === true;
  }

  if (actionConfig.tenantAdminOnly) {
    if (isPlatformSuperAdmin) return true;
    return role === "admin";
  }

  if (isPlatformSuperAdmin) return true;
  if (role === "admin") return true;

  if (permissions && Array.isArray(permissions)) {
    const dbRow = permissions.find(p => p.permission_key === actionKey);
    if (dbRow && role) {
      if (role === "recruiter") return dbRow.recruiter ?? false;
      if (role === "reviewer") return dbRow.reviewer ?? false;
    }
  }

  // Deny by default for non-admins without explicit DB grant
  return false;
}
