import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
export const taskStages = [
  "backlog",
  "todo",
  "in_progress",
  "in_review",
  "done",
] as const;
export type TaskStage = (typeof taskStages)[number];
export const taskStageLabels: Record<TaskStage, [string, string]> = {
  backlog: ["قائمة الانتظار", "Backlog"],
  todo: ["مخططة", "Planned"],
  in_progress: ["قيد التنفيذ", "In progress"],
  in_review: ["بانتظار المراجعة", "Awaiting review"],
  done: ["مكتملة", "Completed"],
};
export type ChecklistItem = { id: string; title: string; completed: boolean };
export type WorkflowTask = {
  id: string;
  title: string;
  description: string | null;
  expected_outcome: string;
  user_id: string;
  assignee_id: string | null;
  assignee_name: string;
  reviewer_id: string | null;
  reviewer_name: string | null;
  due_date: string;
  priority: "high" | "medium" | "low";
  column_status: TaskStage;
  completion_note: string;
  blocked_reason: string;
  subtasks: ChecklistItem[] | null;
  version: number;
  archived_at: string | null;
  completed_at: string | null;
  job_id: string | null;
  candidate_id: string | null;
  cycle_id: string | null;
  events: {
    id: string;
    action: string;
    actor_name: string;
    at: string;
    from: TaskStage;
    to: TaskStage | null;
    text: string;
  }[];
};
export type TaskWorkspaceData = {
  tasks: WorkflowTask[];
  can_manage: boolean;
  members: { id: string; name: string }[];
  jobs: { id: string; title: string }[];
  candidates: { id: string; name: string }[];
  cycles: { id: string; title: string; subject_id: string }[];
  legacy: {
    id: string;
    title: string;
    description: string;
    due_date: string;
  }[];
};
export async function taskRequest<T>(
  companyId: string,
  action: string,
  payload: Json = {},
): Promise<T> {
  const { data, error } = await supabase.rpc("task_workflow", {
    _company_id: companyId,
    _action: action,
    _payload: payload,
  });
  if (error) throw error;
  if (data === null) throw new Error("Empty task response");
  return data as unknown as T;
}
export function taskTransitions(
  t: WorkflowTask,
  userId: string,
  manager: boolean,
): TaskStage[] {
  if (t.archived_at) return [];
  const owner = manager || t.user_id === userId;
  if (t.column_status === "done") return owner ? ["todo"] : [];
  if (t.column_status === "in_review")
    return [
      ...(t.reviewer_id === userId
        ? (["done", "in_progress"] as TaskStage[])
        : []),
      ...(owner ? (["todo"] as TaskStage[]) : []),
    ];
  if (t.assignee_id !== userId) return [];
  return t.column_status === "backlog"
    ? ["todo"]
    : t.column_status === "todo"
      ? ["in_progress", "backlog"]
      : ["todo", t.reviewer_id ? "in_review" : "done"];
}
export const localTaskDay = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
};
export const taskOverdue = (t: WorkflowTask, today = localTaskDay()) =>
  !t.archived_at && t.column_status !== "done" && t.due_date < today;
export const taskReady = (t: WorkflowTask) =>
  !!t.completion_note.trim() &&
  !t.blocked_reason.trim() &&
  (t.subtasks || []).every((x) => x.completed);
