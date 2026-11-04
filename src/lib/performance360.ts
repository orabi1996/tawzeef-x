import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
export type ReviewGroup = "self" | "manager" | "peers" | "subordinates";
export type Criterion = {
  id: string;
  title: string;
  description: string;
  weight: number;
};
export type Cycle = {
  version?: number;
  id: string;
  title: string;
  subject_id: string;
  subject_name: string;
  period_start: string;
  period_end: string;
  deadline: string;
  status: "draft" | "open" | "closed";
  criteria: Criterion[];
  is_subject: boolean;
};
export type ReviewTask = {
  id: string;
  cycle_id: string;
  relationship: ReviewGroup;
  submitted: boolean;
};
export type CycleList = {
  can_manage: boolean;
  cycles: Cycle[];
  tasks: ReviewTask[];
  members: { user_id: string; name: string }[];
};
export type RosterMember = {
  id: string;
  reviewer_id: string;
  name: string;
  relationship: ReviewGroup;
};
export type CycleReport = {
  overall: number | null;
  available_weight: number;
  closed_at: string;
  groups: Record<ReviewGroup, { assigned: number; submitted: number }>;
  criteria: {
    id: string;
    title: string;
    weight: number;
    external: number | null;
    groups: Record<ReviewGroup, number | null>;
  }[];
};
export async function cycleRequest<T>(
  companyId: string,
  action: string,
  payload: Json = {},
): Promise<T> {
  const { data, error } = await supabase.rpc("performance360", {
    _company_id: companyId,
    _action: action,
    _payload: payload,
  });
  if (error) throw error;
  if (data === null) throw new Error("Empty review response");
  return data as unknown as T;
}
export const reviewGroups: ReviewGroup[] = [
  "self",
  "manager",
  "peers",
  "subordinates",
];
export const groupLabels = {
  self: ["ذاتي", "Self"],
  manager: ["المدير", "Manager"],
  peers: ["الزملاء", "Peers"],
  subordinates: ["المرؤوسون", "Direct reports"],
};
export const scoreLabel = (n: number | null) =>
  n === null ? "—" : n.toFixed(2);
export function scorePayload(
  criteria: Criterion[],
  answers: Record<string, string>,
): Record<string, number | null> | null {
  const scores: Record<string, number | null> = {};
  for (const c of criteria) {
    const value = answers[c.id];
    if (value === "na") scores[c.id] = null;
    else if (/^[1-5]$/.test(value || "")) scores[c.id] = Number(value);
    else return null;
  }
  return scores;
}
export function defaultCriteria(ar: boolean): Criterion[] {
  return [
    [
      "delivery",
      "إنجاز العمل",
      "Delivery",
      "ينجز الالتزامات المتفق عليها في الموعد وبالجودة المطلوبة.",
      "Delivers agreed commitments on time and to the required quality.",
    ],
    [
      "collaboration",
      "التعاون",
      "Collaboration",
      "يتعاون ويشارك المعلومات ويساعد الفريق على إنجاز العمل.",
      "Cooperates, shares information and helps the team deliver.",
    ],
    [
      "communication",
      "التواصل",
      "Communication",
      "يوضح التوقعات ويستمع ويقدّم تحديثات مفيدة في الوقت المناسب.",
      "Clarifies expectations, listens and provides timely useful updates.",
    ],
    [
      "expertise",
      "المهارات المهنية",
      "Role skills",
      "يطبق المهارات اللازمة لدوره ويعالج المشكلات ضمن مسؤولياته.",
      "Applies role-relevant skills and solves problems within their responsibilities.",
    ],
    [
      "ownership",
      "المسؤولية والتطوير",
      "Ownership and development",
      "يتحمل مسؤولية العمل ويستفيد من الملاحظات لتحسين أدائه.",
      "Takes responsibility and uses feedback to improve their work.",
    ],
  ].map(([id, ta, te, da, de]) => ({
    id,
    title: ar ? ta : te,
    description: ar ? da : de,
    weight: 20,
  }));
}

export function cycleReadiness(
  roster: RosterMember[],
  members: CycleList["members"],
  deadline: string,
  now = Date.now(),
): string[] {
  const reasons: string[] = [];
  if (!roster.some((r) => r.relationship !== "self")) reasons.push("external");
  for (const group of ["peers", "subordinates"] as const) {
    const n = roster.filter((r) => r.relationship === group).length;
    if (n > 0 && n < 3) reasons.push(group);
  }
  if (roster.some((r) => !members.some((m) => m.user_id === r.reviewer_id)))
    reasons.push("inactive");
  if (new Date(deadline).getTime() <= now) reasons.push("deadline");
  return reasons;
}
