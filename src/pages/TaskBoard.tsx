import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  RefreshCw,
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyContext } from "@/contexts/CompanyContext";
import { useI18n } from "@/contexts/I18nContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  taskRequest,
  taskStages,
  taskStageLabels,
  taskTransitions,
  taskReady,
  taskOverdue,
  localTaskDay,
  type WorkflowTask,
  type TaskWorkspaceData,
  type TaskStage,
  type ChecklistItem,
} from "@/lib/taskWorkflow";
import type { Json } from "@/integrations/supabase/types";
const selectClass = "w-full rounded-lg border bg-background p-2 text-sm";
export default function TaskBoard() {
  const { user } = useAuth();
  const { activeCompanyId, activeCompany, isLoading } = useCompanyContext();
  const { locale, dir } = useI18n();
  const [params] = useSearchParams();
  const ar = locale === "ar";
  return (
    <DashboardLayout>
      <main dir={dir} className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
        <header className="flex flex-wrap justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              {activeCompany?.name}
            </p>
            <h1 className="text-3xl font-bold">
              {ar ? "إدارة المهام" : "Task management"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {ar
                ? "مسؤول واضح، ناتج متفق عليه، ومراجعة قبل الإغلاق عند تكليف مراجع."
                : "Clear ownership, agreed outcomes, and approval before completion when a reviewer is assigned."}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/evaluation">
              {ar ? "دورات تقييم الأداء" : "Performance reviews"}
            </Link>
          </Button>
        </header>
        {isLoading ? (
          <p role="status">{ar ? "جارٍ تحميل الشركة…" : "Loading company…"}</p>
        ) : !user || !activeCompanyId ? (
          <p>
            {ar
              ? "اختر شركة نشطة من قائمة الشركات."
              : "Select an active company."}
          </p>
        ) : (
          <TaskWorkspace
            key={`${activeCompanyId}:${user.id}:${locale}`}
            companyId={activeCompanyId}
            userId={user.id}
            ar={ar}
            initialCycle={params.get("cycle") || ""}
            initialCreate={params.get("action") === "new"}
          />
        )}
      </main>
    </DashboardLayout>
  );
}
export function TaskWorkspace({
  companyId,
  userId,
  ar,
  initialCycle = "",
  initialCreate = false,
}: {
  companyId: string;
  userId: string;
  ar: boolean;
  initialCycle?: string;
  initialCreate?: boolean;
}) {
  const [archived, setArchived] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("all");
  const [view, setView] = useState<"board" | "list">("board");
  const [selected, setSelected] = useState("");
  const [detail, setDetail] = useState<WorkflowTask | null>(null);
  const [creating, setCreating] = useState(initialCreate || !!initialCycle);
  const [editing, setEditing] = useState(false);
  const [importId, setImportId] = useState("");
  const q = useQuery({
    queryKey: ["task-workflow", companyId, userId, archived],
    queryFn: () =>
      taskRequest<TaskWorkspaceData>(companyId, "list", { archived }),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  });
  const cache = useQueryClient();
  const { toast } = useToast();
  const mutation = useMutation({
    mutationFn: ({ action, payload }: { action: string; payload: Json }) =>
      taskRequest<{ id: string }>(companyId, action, payload),
    onSuccess: async (r) => {
      await cache.invalidateQueries({
        queryKey: ["task-workflow", companyId, userId],
      });
      const latest = await q.refetch();
      setDetail(latest.data?.tasks.find((t) => t.id === r.id) || null);
      setCreating(false);
      setEditing(false);
      setImportId("");
      setSelected(r.id);
      toast({ title: ar ? "تم حفظ التغيير" : "Change saved" });
    },
    onError: (e: Error) => {
      cache.invalidateQueries({
        queryKey: ["task-workflow", companyId, userId],
      });
      toast({
        title: ar ? "لم يتم حفظ التغيير" : "Change was not saved",
        description: e.message.includes("CONFLICT")
          ? ar
            ? "تم تحديث المهمة من جلسة أخرى. راجع أحدث بياناتها ثم أعد المحاولة."
            : "Another session updated this task. Review the latest version and retry."
          : ar
            ? "راجع صلاحيتك، حالة المهمة، اكتمال الأنشطة وناتج التنفيذ."
            : "Check your access, task state, completed activities and delivery result.",
        variant: "destructive",
      });
    },
  });
  const act = (action: string, payload: Json) =>
    mutation.mutateAsync({ action, payload });
  if (q.isPending)
    return <p role="status">{ar ? "جارٍ تحميل المهام…" : "Loading tasks…"}</p>;
  if (q.isError)
    return (
      <div role="alert">
        <p>{ar ? "تعذّر تحميل المهام." : "Could not load tasks."}</p>
        <Button onClick={() => q.refetch()}>
          {ar ? "إعادة المحاولة" : "Retry"}
        </Button>
      </div>
    );
  const data = q.data;
  const selectedTask = detail;
  const remoteTask = data.tasks.find((t) => t.id === selected);
  const owned = (t: WorkflowTask) => data.can_manage || t.user_id === userId;
  const visible = data.tasks
    .filter(
      (t) =>
        (!search ||
          `${t.title} ${t.description || ""} ${t.assignee_name}`
            .toLowerCase()
            .includes(search.toLowerCase())) &&
        (priority === "all" || t.priority === priority) &&
        (filter === "all" ||
          (filter === "mine" && t.assignee_id === userId) ||
          (filter === "review" &&
            t.reviewer_id === userId &&
            t.column_status === "in_review") ||
          (filter === "overdue" && taskOverdue(t)) ||
          (filter === "blocked" && !!t.blocked_reason)),
    )
    .sort((a, b) => a.due_date.localeCompare(b.due_date));
  const stage = (s: TaskStage) => taskStageLabels[s][ar ? 0 : 1];
  return (
    <>
      <div className="rounded-xl border bg-muted/30 p-4 text-sm">
        {ar
          ? "خط السير: تخطيط ← تنفيذ ← مراجعة (عند اختيار مراجع) ← إكمال. لا تتحول أعداد المهام تلقائيًا إلى درجات أداء الموظف."
          : "Workflow: plan → execute → review (when assigned) → complete. Task counts do not automatically become employee performance scores."}
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          [
            ClipboardList,
            ar ? "مفتوحة" : "Open",
            data.tasks.filter((t) => t.column_status !== "done").length,
          ],
          [
            Clock,
            ar ? "متأخرة عن موعدها" : "Overdue",
            data.tasks.filter((t) => taskOverdue(t)).length,
          ],
          [
            AlertCircle,
            ar ? "بانتظار مراجعتي" : "Awaiting my review",
            data.tasks.filter(
              (t) =>
                t.column_status === "in_review" && t.reviewer_id === userId,
            ).length,
          ],
          [
            CheckCircle2,
            ar ? "مكتملة" : "Completed",
            data.tasks.filter((t) => t.column_status === "done").length,
          ],
        ].map(([Icon, label, count]) => {
          const I = Icon as typeof ClipboardList;
          return (
            <Card key={String(label)}>
              <CardContent className="flex items-center gap-3 p-4">
                <I className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {String(label)}
                    {archived ? (ar ? " (الأرشيف)" : " (archive)") : ""}
                  </p>
                  <strong className="text-2xl">{String(count)}</strong>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              setArchived(false);
              setCreating(!creating);
              setEditing(false);
              setImportId("");
            }}
          >
            <Plus className="me-2 h-4 w-4" />
            {ar ? "إضافة مهمة جديدة" : "New task"}
          </Button>
          <Button
            variant="outline"
            onClick={() => q.refetch()}
            disabled={q.isFetching}
          >
            <RefreshCw className="me-2 h-4 w-4" />
            {ar ? "تحديث" : "Refresh"}
          </Button>
          <Button
            variant={archived ? "secondary" : "outline"}
            onClick={() => {
              setArchived(!archived);
              setSelected("");
              setDetail(null);
              setEditing(false);
              setFilter("all");
            }}
          >
            {archived
              ? ar
                ? "المهام النشطة"
                : "Active tasks"
              : ar
                ? "الأرشيف"
                : "Archive"}
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === "board" ? "secondary" : "ghost"}
            onClick={() => setView("board")}
          >
            {ar ? "لوحة" : "Board"}
          </Button>
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            onClick={() => setView("list")}
          >
            {ar ? "قائمة" : "List"}
          </Button>
        </div>
      </div>
      {!!data.legacy.length && (
        <aside className="space-y-2 rounded-xl border p-4">
          <p>
            {ar
              ? "مهام شخصية سابقة: حدد الشركة والمسؤول والناتج لاستكمالها في سير العمل الجديد."
              : "Previous personal tasks: confirm company, assignee and outcome to import into this workflow."}
          </p>
          {data.legacy.map((t) => (
            <Button
              key={t.id}
              variant="outline"
              onClick={() => {
                setImportId(t.id);
                setCreating(true);
                setEditing(false);
              }}
            >
              {ar ? "استيراد: " : "Import: "}
              {t.title}
            </Button>
          ))}
        </aside>
      )}
      {(creating || (editing && selectedTask)) && (
        <TaskForm
          key={editing ? selectedTask?.id : importId || "new"}
          ar={ar}
          data={data}
          userId={userId}
          task={editing ? selectedTask : undefined}
          legacy={data.legacy.find((t) => t.id === importId)}
          initialCycle={initialCycle}
          pending={mutation.isPending}
          cancel={() => {
            setCreating(false);
            setEditing(false);
            setImportId("");
          }}
          save={(p) =>
            act(editing ? "edit" : importId ? "import" : "create", p)
          }
        />
      )}
      <div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr]">
        <Input
          aria-label={ar ? "بحث المهام" : "Search tasks"}
          placeholder={
            ar ? "ابحث بالعنوان أو المسؤول" : "Search title or assignee"
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          aria-label={ar ? "عرض المهام" : "Task filter"}
          className={selectClass}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          {[
            ["all", "كل المهام المتاحة", "All available"],
            ["mine", "المسندة إليّ", "Assigned to me"],
            ["review", "بانتظار مراجعتي", "Awaiting my review"],
            ["overdue", "متأخرة", "Overdue"],
            ["blocked", "لها عائق", "Blocked"],
          ].map(([v, a, e]) => (
            <option key={v} value={v}>
              {ar ? a : e}
            </option>
          ))}
        </select>
        <select
          aria-label={ar ? "الأولوية" : "Priority"}
          className={selectClass}
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          {[
            ["all", "كل الأولويات", "All priorities"],
            ["high", "عالية", "High"],
            ["medium", "متوسطة", "Medium"],
            ["low", "منخفضة", "Low"],
          ].map(([v, a, e]) => (
            <option key={v} value={v}>
              {ar ? a : e}
            </option>
          ))}
        </select>
      </div>
      <p className="text-xs text-muted-foreground">
        {ar
          ? "تظهر أحدث ٥٠٠ مهمة متاحة لك في الشركة، مرتبة هنا حسب موعد التسليم."
          : "Shows the latest 500 tasks available to you in this company, ordered here by due date."}
      </p>
      {!visible.length ? (
        <p className="rounded-xl border border-dashed p-8 text-center">
          {data.tasks.length
            ? ar
              ? "لا توجد مهام تطابق الفلاتر."
              : "No tasks match these filters."
            : ar
              ? "لا توجد مهام هنا بعد. ابدأ بمهمة واضحة ومسؤول محدد."
              : "No tasks here yet. Start with a clear outcome and an assignee."}
        </p>
      ) : (
        <div
          className={
            view === "board"
              ? "grid gap-4 md:grid-cols-2 xl:grid-cols-5"
              : "space-y-3"
          }
        >
          {(view === "board" ? taskStages : (["all"] as const)).map((col) => (
            <section key={col} className="space-y-3">
              {col !== "all" && (
                <h2 className="flex justify-between rounded-lg bg-muted p-3 font-semibold">
                  <span>{stage(col)}</span>
                  <span>
                    {visible.filter((t) => t.column_status === col).length}
                  </span>
                </h2>
              )}
              {visible
                .filter((t) => col === "all" || t.column_status === col)
                .map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelected(t.id);
                      setDetail(t);
                      setEditing(false);
                    }}
                    aria-pressed={selected === t.id}
                    className={`w-full space-y-3 rounded-xl border bg-card p-4 text-start shadow-sm ${selected === t.id ? "border-primary ring-1 ring-primary" : ""}`}
                  >
                    <p className="font-semibold">{t.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {t.assignee_name} · {stage(t.column_status)}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span
                        className={`rounded-full px-2 py-1 ${taskOverdue(t) ? "bg-destructive/10 text-destructive" : "bg-muted"}`}
                      >
                        {t.due_date}
                        {taskOverdue(t)
                          ? ar
                            ? " · متأخرة"
                            : " · overdue"
                          : ""}
                      </span>
                      <span className="rounded-full bg-muted px-2 py-1">
                        {
                          {
                            high: ar ? "عالية" : "High",
                            medium: ar ? "متوسطة" : "Medium",
                            low: ar ? "منخفضة" : "Low",
                          }[t.priority]
                        }
                      </span>
                    </div>
                    {!!t.blocked_reason && (
                      <p className="text-sm text-amber-700 dark:text-amber-400">
                        {ar ? "عائق: " : "Blocked: "}
                        {t.blocked_reason}
                      </p>
                    )}
                    {!!t.subtasks?.length && (
                      <p className="text-xs">
                        {t.subtasks.filter((s) => s.completed).length}/
                        {t.subtasks.length}{" "}
                        {ar ? "أنشطة مكتملة" : "activities completed"}
                      </p>
                    )}
                    <span className="flex items-center gap-1 text-xs text-primary">
                      {ar
                        ? "التفاصيل والإجراء التالي"
                        : "Details and next action"}
                      <ArrowUpRight className="h-3 w-3" />
                    </span>
                  </button>
                ))}
            </section>
          ))}
        </div>
      )}
      <Dialog
        open={!!selectedTask && !editing && !creating}
        onOpenChange={(open) => {
          if (!open && !mutation.isPending) {
            setDetail(null);
            setSelected("");
          }
        }}
      >
        <DialogContent
          dir={ar ? "rtl" : "ltr"}
          className="max-h-[90vh] max-w-4xl overflow-y-auto"
        >
          <DialogTitle className="sr-only">
            {ar ? "تفاصيل المهمة" : "Task details"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {ar
              ? "التنفيذ والمراجعة وسجل التغييرات"
              : "Work, review and activity history"}
          </DialogDescription>
          {selectedTask &&
            remoteTask &&
            selectedTask.version !== remoteTask.version && (
              <div
                role="alert"
                className="rounded-xl border border-amber-500 p-4"
              >
                <p>
                  {ar
                    ? "توجد نسخة أحدث للمهمة. احتفظ بنصك قبل تحميل التحديث؛ لن يتم استبدال ما كتبته تلقائيًا."
                    : "This task has a newer version. Keep a copy of your edits before reloading; your input is not replaced automatically."}
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDetail(remoteTask);
                    setEditing(false);
                  }}
                >
                  {ar ? "تحميل أحدث نسخة" : "Load latest version"}
                </Button>
              </div>
            )}
          {selectedTask && (
            <TaskDetails
              key={`${selectedTask.id}:${selectedTask.version}`}
              task={selectedTask}
              ar={ar}
              userId={userId}
              manager={data.can_manage}
              pending={mutation.isPending}
              act={act}
              edit={() => {
                setEditing(true);
                setCreating(false);
              }}
              canEdit={owned(selectedTask)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
function TaskForm({
  ar,
  data,
  userId,
  task,
  legacy,
  initialCycle,
  pending,
  cancel,
  save,
}: {
  ar: boolean;
  data: TaskWorkspaceData;
  userId: string;
  task?: WorkflowTask;
  legacy?: TaskWorkspaceData["legacy"][number];
  initialCycle: string;
  pending: boolean;
  cancel: () => void;
  save: (p: Json) => Promise<unknown>;
}) {
  const [who, setWho] = useState(task?.assignee_id || userId);
  const [reviewer, setReviewer] = useState(task?.reviewer_id || "");
  const [title, setTitle] = useState(task?.title || legacy?.title || "");
  const [outcome, setOutcome] = useState(task?.expected_outcome || "");
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {task
            ? ar
              ? "تعديل التخطيط"
              : "Edit plan"
            : ar
              ? "تخطيط مهمة"
              : "Plan a task"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            try {
              await save({
                ...(task
                  ? { id: task.id, version: task.version }
                  : legacy
                    ? { id: legacy.id }
                    : {}),
                title: title.trim(),
                description: String(f.get("description")),
                expected_outcome: outcome.trim(),
                assignee_id: who,
                reviewer_id: reviewer || null,
                due_date: String(f.get("due_date")),
                priority: String(f.get("priority")),
                job_id: String(f.get("job_id") || "") || null,
                candidate_id: String(f.get("candidate_id") || "") || null,
                cycle_id: String(f.get("cycle_id") || "") || null,
              });
            } catch {
              /* error toast retains form */
            }
          }}
        >
          {!task && !legacy && (
            <label className="block space-y-1">
              <span>{ar ? "قالب اختياري" : "Optional template"}</span>
              <select
                className={selectClass}
                defaultValue=""
                onChange={(e) => {
                  const templates: Record<string, [string, string]> = {
                    screen: ar
                      ? [
                          "مراجعة طلب توظيف",
                          "توثيق مدى استيفاء متطلبات الوظيفة وأسباب التوصية.",
                        ]
                      : [
                          "Review an application",
                          "Document job requirement evidence and the reasons for the recommendation.",
                        ],
                    interview: ar
                      ? [
                          "تنسيق مقابلة",
                          "تأكيد موعد المقابلة والمشاركين وإرسال التفاصيل.",
                        ]
                      : [
                          "Coordinate an interview",
                          "Confirm time, participants and interview details.",
                        ],
                    development: ar
                      ? [
                          "متابعة هدف تطوير",
                          "تنفيذ النشاط المتفق عليه وتوثيق الناتج للمناقشة.",
                        ]
                      : [
                          "Follow up a development goal",
                          "Complete the agreed activity and document the result for discussion.",
                        ],
                  };
                  const t = templates[e.target.value];
                  if (t) {
                    setTitle(t[0]);
                    setOutcome(t[1]);
                  }
                }}
              >
                <option value="">{ar ? "مهمة مخصصة" : "Custom task"}</option>
                <option value="screen">
                  {ar ? "مراجعة طلب توظيف" : "Application review"}
                </option>
                <option value="interview">
                  {ar ? "تنسيق مقابلة" : "Interview coordination"}
                </option>
                <option value="development">
                  {ar ? "هدف تطوير" : "Development goal"}
                </option>
              </select>
            </label>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span>{ar ? "عنوان المهمة" : "Task title"}</span>
              <Input
                required
                maxLength={160}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
            <label className="space-y-1">
              <span>{ar ? "المسؤول" : "Assignee"}</span>
              <select
                required
                className={selectClass}
                value={who}
                onChange={(e) => {
                  setWho(e.target.value);
                  if (reviewer === e.target.value) setReviewer("");
                }}
              >
                {data.members
                  .filter((m) => data.can_manage || m.id === userId)
                  .map((m) => (
                    <option value={m.id} key={m.id}>
                      {m.name}
                    </option>
                  ))}
              </select>
            </label>
            <label className="space-y-1">
              <span>{ar ? "المراجع" : "Reviewer"}</span>
              <select
                className={selectClass}
                value={reviewer}
                onChange={(e) => setReviewer(e.target.value)}
              >
                <option value="">
                  {ar ? "بدون مراجعة مستقلة" : "No independent review"}
                </option>
                {data.members
                  .filter((m) => m.id !== who)
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
              </select>
            </label>
            <label className="space-y-1">
              <span>{ar ? "موعد التسليم" : "Due date"}</span>
              <Input
                type="date"
                name="due_date"
                required
                defaultValue={
                  task?.due_date || legacy?.due_date || localTaskDay()
                }
              />
            </label>
            <label className="space-y-1">
              <span>{ar ? "أولوية المهمة" : "Task priority"}</span>
              <select
                className={selectClass}
                name="priority"
                defaultValue={task?.priority || "medium"}
              >
                <option value="low">{ar ? "منخفضة" : "Low"}</option>
                <option value="medium">{ar ? "متوسطة" : "Medium"}</option>
                <option value="high">{ar ? "عالية" : "High"}</option>
              </select>
            </label>
            <label className="space-y-1">
              <span>{ar ? "دورة تطوير مرتبطة" : "Related closed review"}</span>
              <select
                className={selectClass}
                name="cycle_id"
                defaultValue={task?.cycle_id || initialCycle}
              >
                <option value="">{ar ? "بدون ربط" : "None"}</option>
                {data.cycles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {data.can_manage && (
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span>{ar ? "الوظيفة المرتبطة" : "Related job"}</span>
                <select
                  name="job_id"
                  className={selectClass}
                  defaultValue={task?.job_id || ""}
                >
                  <option value="">{ar ? "بدون ربط" : "None"}</option>
                  {data.jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>{ar ? "المرشح المرتبط" : "Related candidate"}</span>
                <select
                  name="candidate_id"
                  className={selectClass}
                  defaultValue={task?.candidate_id || ""}
                >
                  <option value="">{ar ? "بدون ربط" : "None"}</option>
                  {data.candidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
          <label className="block space-y-1">
            <span>{ar ? "الوصف" : "Description"}</span>
            <Textarea
              name="description"
              maxLength={4000}
              defaultValue={task?.description || legacy?.description || ""}
            />
          </label>
          <label className="block space-y-1">
            <span>
              {ar
                ? "الناتج المطلوب ومعيار القبول"
                : "Expected outcome and acceptance criteria"}
            </span>
            <Textarea
              required
              maxLength={2000}
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              placeholder={
                ar
                  ? "ما الناتج الذي يثبت إنجاز المهمة؟"
                  : "What result will demonstrate completion?"
              }
            />
          </label>
          <p className="text-sm text-muted-foreground">
            {reviewer
              ? ar
                ? "المراجع المختار وحده يعتمد المهمة بعد تسليمها."
                : "Only the assigned reviewer approves after submission."
              : ar
                ? "بدون مراجع: المسؤول يسجل الناتج ويؤكد الإكمال بنفسه."
                : "Without a reviewer, the assignee records the result and confirms completion."}
          </p>
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={pending || !who || !title.trim() || !outcome.trim()}
            >
              {ar ? "حفظ المهمة" : "Save task"}
            </Button>
            <Button type="button" variant="outline" onClick={cancel}>
              {ar ? "إلغاء" : "Cancel"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
function TaskDetails({
  task: t,
  ar,
  userId,
  manager,
  pending,
  act,
  edit,
  canEdit,
}: {
  task: WorkflowTask;
  ar: boolean;
  userId: string;
  manager: boolean;
  pending: boolean;
  act: (a: string, p: Json) => Promise<unknown>;
  edit: () => void;
  canEdit: boolean;
}) {
  const [note, setNote] = useState(t.completion_note);
  const [blocker, setBlocker] = useState(t.blocked_reason);
  const [subtasks, setSubtasks] = useState<ChecklistItem[]>(t.subtasks || []);
  const [activity, setActivity] = useState("");
  const [comment, setComment] = useState("");
  const [reason, setReason] = useState("");
  const [confirm, setConfirm] = useState("");
  const canWork =
    !t.archived_at &&
    t.assignee_id === userId &&
    ["todo", "in_progress"].includes(t.column_status);
  const changed =
    note !== t.completion_note ||
    blocker !== t.blocked_reason ||
    JSON.stringify(subtasks) !== JSON.stringify(t.subtasks || []);
  const execute = async (a: string, p: Json = {}) => {
    try {
      await act(a, { id: t.id, version: t.version, ...(p as object) });
    } catch {
      /* keep unsaved input */
    }
  };
  const label = (s: TaskStage) => taskStageLabels[s][ar ? 0 : 1];
  const actionLabels: Record<string, string> = {
    create: ar ? "إنشاء" : "Created",
    edit: ar ? "تعديل التخطيط" : "Plan edited",
    import: ar ? "استيراد مهمة شخصية" : "Personal task imported",
    work: ar ? "تحديث التنفيذ" : "Work updated",
    comment: ar ? "تعليق" : "Comment",
    transition: ar ? "تغيير الحالة" : "Status changed",
    archive: ar ? "أرشفة" : "Archived",
    restore: ar ? "استرجاع" : "Restored",
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {label(t.column_status)} · {t.assignee_name} ·{" "}
          {ar ? "المراجع: " : "Reviewer: "}
          {t.reviewer_name ||
            (ar ? "بدون مراجعة مستقلة" : "No independent review")}
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-xl bg-muted/40 p-4">
          <h3 className="font-semibold">
            {ar ? "الناتج المطلوب" : "Expected outcome"}
          </h3>
          <p className="whitespace-pre-wrap">{t.expected_outcome}</p>
          {t.description && (
            <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
              {t.description}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {canEdit &&
            !t.archived_at &&
            !["in_review", "done"].includes(t.column_status) && (
              <Button
                variant="outline"
                disabled={pending || changed}
                onClick={edit}
              >
                {ar ? "تعديل التخطيط والتكليف" : "Edit plan and assignment"}
              </Button>
            )}
          {canEdit && (
            <Button
              variant="outline"
              disabled={pending || changed}
              onClick={() => setConfirm(t.archived_at ? "restore" : "archive")}
            >
              {t.archived_at
                ? ar
                  ? "استرجاع المهمة"
                  : "Restore task"
                : ar
                  ? "أرشفة المهمة"
                  : "Archive task"}
            </Button>
          )}
          {t.cycle_id && (
            <Button asChild variant="outline">
              <Link to={`/evaluation?cycle=${t.cycle_id}`}>
                {ar ? "دورة التقييم المرتبطة" : "Related review cycle"}
              </Link>
            </Button>
          )}
        </div>
        <div className="space-y-3">
          <h3 className="font-semibold">
            {ar ? "أنشطة التنفيذ" : "Work checklist"}
          </h3>
          {subtasks.map((s) => (
            <div key={s.id} className="flex items-center gap-2">
              <label className="flex flex-1 items-center gap-2">
                <input
                  type="checkbox"
                  disabled={!canWork || pending}
                  checked={s.completed}
                  onChange={(e) =>
                    setSubtasks(
                      subtasks.map((x) =>
                        x.id === s.id
                          ? { ...x, completed: e.target.checked }
                          : x,
                      ),
                    )
                  }
                />
                <span>{s.title}</span>
              </label>
              {canWork && (
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={pending}
                  onClick={() =>
                    setSubtasks(subtasks.filter((x) => x.id !== s.id))
                  }
                >
                  {ar ? "إزالة النشاط" : "Remove activity"}
                </Button>
              )}
            </div>
          ))}
          {canWork && (
            <div className="flex gap-2">
              <Input
                aria-label={ar ? "نشاط جديد" : "New activity"}
                maxLength={300}
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
              />
              <Button
                variant="outline"
                disabled={pending || !activity.trim() || subtasks.length >= 50}
                onClick={() => {
                  setSubtasks([
                    ...subtasks,
                    {
                      id: crypto.randomUUID(),
                      title: activity.trim(),
                      completed: false,
                    },
                  ]);
                  setActivity("");
                }}
              >
                {ar ? "إضافة نشاط" : "Add activity"}
              </Button>
            </div>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1">
            <span>
              {ar
                ? "ناتج التنفيذ / دليل الإنجاز"
                : "Delivery result / evidence"}
            </span>
            <Textarea
              disabled={!canWork || pending}
              maxLength={4000}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
          <label className="space-y-1">
            <span>
              {ar
                ? "العائق الحالي (اتركه فارغًا بعد حله)"
                : "Current blocker (clear when resolved)"}
            </span>
            <Textarea
              disabled={!canWork || pending}
              maxLength={1000}
              value={blocker}
              onChange={(e) => setBlocker(e.target.value)}
            />
          </label>
        </div>
        {canWork && (
          <Button
            disabled={pending || !changed}
            onClick={() =>
              execute("work", {
                completion_note: note,
                blocked_reason: blocker,
                subtasks,
              })
            }
          >
            {ar ? "حفظ تحديث التنفيذ" : "Save work update"}
          </Button>
        )}
        {changed && canWork && (
          <p
            role="status"
            className="text-sm text-amber-700 dark:text-amber-400"
          >
            {ar
              ? "احفظ التحديث قبل تغيير الحالة."
              : "Save your work update before changing status."}
          </p>
        )}
        {!t.archived_at && (
          <div className="space-y-3">
            <h3 className="font-semibold">
              {ar ? "الإجراء التالي" : "Next action"}
            </h3>
            {!taskReady(t) &&
              ["todo", "in_progress"].includes(t.column_status) && (
                <p className="text-sm text-muted-foreground">
                  {ar
                    ? "للتسليم: سجّل الناتج، أكمل الأنشطة، واحذف وصف العائق بعد حله."
                    : "Before submitting: record the result, complete activities and clear resolved blockers."}
                </p>
              )}
            <div className="flex flex-wrap gap-2">
              {taskTransitions(t, userId, manager).map((s) => (
                <Button
                  key={s}
                  variant={s === "done" ? "default" : "outline"}
                  disabled={
                    pending ||
                    changed ||
                    (["in_review", "done"].includes(s) && !taskReady(t))
                  }
                  onClick={() => {
                    setReason("");
                    setConfirm(s);
                  }}
                >
                  {s === "done"
                    ? t.reviewer_id
                      ? ar
                        ? "اعتماد وإكمال"
                        : "Approve and complete"
                      : ar
                        ? "تأكيد الإكمال"
                        : "Confirm completion"
                    : s === "in_review"
                      ? ar
                        ? "تسليم للمراجعة"
                        : "Submit for review"
                      : t.column_status === "done"
                        ? ar
                          ? "إعادة فتح"
                          : "Reopen"
                        : t.column_status === "in_review" && s === "todo"
                          ? ar
                            ? "سحب المراجعة لإعادة التخطيط"
                            : "Recall review to replan"
                          : t.column_status === "in_review"
                            ? ar
                              ? "إعادة للتعديل"
                              : "Request revision"
                            : (ar ? "نقل إلى: " : "Move to: ") + label(s)}
                </Button>
              ))}
            </div>
          </div>
        )}
        {confirm && (
          <div
            role="alert"
            className="space-y-3 rounded-xl border border-primary/40 p-4"
          >
            <p>
              {confirm === "archive"
                ? ar
                  ? "ستنتقل المهمة للأرشيف ويمكن استرجاعها."
                  : "The task will move to the archive and can be restored."
                : confirm === "restore"
                  ? ar
                    ? "استرجاع المهمة بحالتها السابقة؟"
                    : "Restore the task in its previous state?"
                  : (ar
                      ? "تأكيد تغيير الحالة إلى: "
                      : "Confirm status change to: ") +
                    label(confirm as TaskStage)}
            </p>
            {["done", "in_review"].includes(t.column_status) &&
              ["todo", "in_progress"].includes(confirm) && (
                <label className="block">
                  <span>{ar ? "سبب الإعادة" : "Reason for returning"}</span>
                  <Textarea
                    maxLength={2000}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </label>
              )}
            <div className="flex gap-2">
              <Button
                disabled={
                  pending ||
                  (["done", "in_review"].includes(t.column_status) &&
                    ["todo", "in_progress"].includes(confirm) &&
                    !reason.trim())
                }
                onClick={() =>
                  execute(
                    ["archive", "restore"].includes(confirm)
                      ? confirm
                      : "transition",
                    { status: confirm, reason },
                  )
                }
              >
                {ar ? "تأكيد الإجراء" : "Confirm action"}
              </Button>
              <Button variant="outline" onClick={() => setConfirm("")}>
                {ar ? "إلغاء" : "Cancel"}
              </Button>
            </div>
          </div>
        )}
        {!t.archived_at && (
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              execute("comment", { text: comment });
            }}
          >
            <Input
              aria-label={ar ? "تعليق على المهمة" : "Task comment"}
              maxLength={2000}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={ar ? "اكتب تعليقًا للفريق…" : "Add a comment…"}
            />
            <Button disabled={pending || changed || !comment.trim()}>
              {ar ? "إضافة تعليق" : "Add comment"}
            </Button>
          </form>
        )}
        <section className="space-y-3">
          <h3 className="font-semibold">
            {ar ? "سجل التغييرات والمناقشة" : "Activity and discussion"}
          </h3>
          {[...t.events].reverse().map((e) => (
            <div className="rounded-lg border p-3 text-sm" key={e.id}>
              <div className="flex flex-wrap justify-between gap-2">
                <strong>
                  {e.actor_name} · {actionLabels[e.action] || e.action}
                </strong>
                <time className="text-xs text-muted-foreground">
                  {new Date(e.at).toLocaleString(ar ? "ar-EG" : "en-US")}
                </time>
              </div>
              {e.to && (
                <p>
                  {label(e.from)} → {label(e.to)}
                </p>
              )}
              {e.text && <p className="mt-2 whitespace-pre-wrap">{e.text}</p>}
            </div>
          ))}
        </section>
      </CardContent>
    </Card>
  );
}
