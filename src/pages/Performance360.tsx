import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyContext } from "@/contexts/CompanyContext";
import { useI18n } from "@/contexts/I18nContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  cycleReadiness,
  cycleRequest,
  defaultCriteria,
  groupLabels,
  reviewGroups,
  scoreLabel,
  scorePayload,
  type Criterion,
  type Cycle,
  type CycleList,
  type CycleReport,
  type ReviewTask,
  type RosterMember,
} from "@/lib/performance360";
import type { Json } from "@/integrations/supabase/types";

const selectClass = "w-full rounded-md border bg-background p-2 text-sm";
const localDay = (date = new Date()) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

export default function Performance360() {
  const { user } = useAuth();
  const { activeCompanyId, activeCompany, isLoading } = useCompanyContext();
  const { locale, dir } = useI18n();
  const ar = locale === "ar";
  const [params] = useSearchParams();
  return (
    <DashboardLayout>
      <main dir={dir} className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              {activeCompany?.name}
            </p>
            <h1 className="text-2xl font-bold">
              {ar
                ? "دورات تقييم ٣٦٠ المستقلة"
                : "Independent 360 review cycles"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {ar
                ? "ملاحظات من حسابات المشاركين، بمعايير معلنة ونتائج مجمّعة."
                : "Feedback from assigned accounts, with explicit criteria and aggregated results."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to="/tasks">{ar ? "إدارة المهام" : "Task management"}</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/evaluation/manual">
                {ar ? "السجل اليدوي السابق" : "Previous manual log"}
              </Link>
            </Button>
          </div>
        </header>
        {isLoading ? (
          <p role="status">
            {ar ? "جارٍ التحقق من الشركة…" : "Checking company…"}
          </p>
        ) : !activeCompanyId || !user ? (
          <p>
            {ar
              ? "اختر شركة نشطة من قائمة الشركات لاستخدام دورات التقييم."
              : "Select an active company to use review cycles."}
          </p>
        ) : (
          <CycleWorkspace
            key={`${activeCompanyId}:${user.id}:${locale}`}
            companyId={activeCompanyId}
            userId={user.id}
            ar={ar}
            initialCycle={params.get("cycle") || ""}
          />
        )}
      </main>
    </DashboardLayout>
  );
}

export function CycleWorkspace({
  companyId,
  userId,
  ar,
  initialCycle = "",
}: {
  companyId: string;
  userId: string;
  ar: boolean;
  initialCycle?: string;
}) {
  const [selected, setSelected] = useState(initialCycle);
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState<Cycle | null>(null);
  const [creating, setCreating] = useState(false);
  const query = useQuery({
    queryKey: ["performance360", companyId, userId],
    queryFn: () => cycleRequest<CycleList>(companyId, "list"),
    retry: 1,
    // Cycles and assignments can be added by another account while this page is cached.
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  });
  const { toast } = useToast();
  const cache = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ action, payload }: { action: string; payload: Json }) =>
      cycleRequest<{ id?: string }>(companyId, action, payload),
    onSuccess: (result) => {
      cache.invalidateQueries({
        queryKey: ["performance360", companyId, userId],
      });
      if (result.id) {
        setSelected(result.id);
        setCreating(false);
        setEditing(null);
      }
      toast({ title: ar ? "تم حفظ التغيير" : "Change saved" });
    },
    onError: (e: Error) => {
      void cache.invalidateQueries({queryKey:["performance360", companyId, userId]});
      toast({
        title: ar ? "تعذّر تنفيذ العملية" : "Operation could not be completed",
        description: e.message.includes("CONFLICT")
          ? ar
            ? "عدّل شخص آخر هذه المسودة. احتفظ بنصك وألغِ التعديل ثم افتح أحدث نسخة."
            : "Someone updated this draft. Keep your text, cancel editing and open the latest version."
          : ar
            ? "راجع المشاركين، الأوزان، الموعد وحالة الدورة، ثم حدّث الصفحة."
            : "Check participants, weights, deadline and cycle state, then refresh.",
        variant: "destructive",
      });
    },
  });
  if (query.isPending)
    return (
      <p role="status">{ar ? "جارٍ تحميل الدورات…" : "Loading cycles…"}</p>
    );
  if (query.isError)
    return (
      <div role="alert">
        <p>
          {ar
            ? "تعذّر تحميل الدورات. لم تُعرض نتائج بديلة."
            : "Could not load cycles. No substitute results are shown."}
        </p>
        <Button onClick={() => query.refetch()}>
          {ar ? "إعادة المحاولة" : "Retry"}
        </Button>
      </div>
    );
  const data = query.data;
  const cycle = data.cycles.find((c) => c.id === selected);
  const task = data.tasks.find((t) => t.cycle_id === cycle?.id);
  const act = (action: string, payload: Json) =>
    mutation.mutate({ action, payload });
  const label = (g: keyof typeof groupLabels) => groupLabels[g][ar ? 0 : 1];
  const shown = data.cycles.filter(
    (c) =>
      filter === "all" ||
      filter === c.status ||
      (filter === "mine" &&
        data.tasks.some(
          (t) => t.cycle_id === c.id && !t.submitted && c.status === "open",
        )),
  );
  return (
    <>
      <ol className="grid gap-3 sm:grid-cols-4">
        {(ar
          ? [
              "تحديد المعايير والفترة",
              "اختيار المشاركين",
              "جمع الردود المستقلة",
              "إغلاق ومناقشة وخطة تطوير",
            ]
          : [
              "Set criteria and period",
              "Assign participants",
              "Collect independent responses",
              "Close, discuss and develop",
            ]
        ).map((s, i) => (
          <li className="rounded-xl border bg-card p-4 text-sm" key={s}>
            <span className="me-2 font-bold text-primary">{i + 1}</span>
            {s}
          </li>
        ))}
      </ol>
      <div className="grid gap-3 sm:grid-cols-3">
        {(["draft", "open", "closed"] as const).map((status) => (
          <Card key={status}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                {
                  {
                    draft: ar ? "قيد الإعداد" : "In preparation",
                    open: ar ? "جمع الردود" : "Collecting feedback",
                    closed: ar ? "تقارير مغلقة" : "Closed reports",
                  }[status]
                }
              </p>
              <strong className="text-2xl">
                {data.cycles.filter((c) => c.status === status).length}
              </strong>
            </CardContent>
          </Card>
        ))}
      </div>
      <aside className="rounded-xl border bg-muted/30 p-4 text-sm space-y-2">
        <p>
          {ar
            ? "سرية النتائج: تظهر بعد إغلاق الدورة لمسؤوليها والموظف المعني فقط. لا تُعرض إجابات الزملاء أو المرؤوسين منفردة؛ يلزم ثلاثة ردود صالحة لكل معيار في كل فئة."
            : "Results are available only after closing, to cycle administrators and the subject. Peer and direct-report answers are never shown individually; each criterion needs three valid responses per confidential group."}
        </p>
        <p>
          {ar
            ? "المسؤول يحدد علاقة المشاركين بالموظف؛ النظام يتحقق من عضوية الشركة وهوية الحساب. المسؤول يعرف قائمة المشاركين، وتقييم المدير والتقييم الذاتي ليسا مجهولين."
            : "The administrator assigns reviewer relationships; the system verifies company membership and account identity. Administrators know the participant list. Manager and self ratings are not anonymous."}
        </p>
        <p>
          {ar
            ? "هذه أداة للتطوير والنقاش، وليست اختبارًا مهنيًا معتمدًا أو قرارًا آليًا للترقية أو الأجر."
            : "This is a development and discussion tool, not a validated assessment or an automated promotion or pay decision."}
        </p>
      </aside>
      <div className="flex flex-wrap justify-between gap-3">
        <h2 className="text-lg font-semibold">
          {ar
            ? "الدورات والمهام الموكلة إليك"
            : "Cycles and your assigned reviews"}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => query.refetch()}
            disabled={query.isFetching}
          >
            {ar ? "تحديث" : "Refresh"}
          </Button>
          {data.can_manage && (
            <Button onClick={() => setCreating(!creating)}>
              {ar ? "إنشاء دورة" : "Create cycle"}
            </Button>
          )}
        </div>
      </div>
      <label className="block max-w-sm space-y-1">
        <span>{ar ? "عرض الدورات" : "Cycle filter"}</span>
        <select
          className={selectClass}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          {[
            ["all", "كل الدورات", "All cycles"],
            ["mine", "تقييمات مطلوبة مني", "My pending reviews"],
            ["draft", "قيد الإعداد", "In preparation"],
            ["open", "مفتوحة", "Open"],
            ["closed", "مغلقة", "Closed"],
          ].map(([v, a, e]) => (
            <option key={v} value={v}>
              {ar ? a : e}
            </option>
          ))}
        </select>
      </label>
      {creating && data.can_manage && (
        <CreateCycle
          ar={ar}
          members={data.members}
          pending={mutation.isPending}
          submit={(p) => act("create", p)}
        />
      )}
      {editing && data.can_manage && (
        <CreateCycle
          key={editing.id}
          existing={editing}
          ar={ar}
          members={data.members}
          pending={mutation.isPending}
          submit={(p) => act("edit", p)}
          cancel={() => setEditing(null)}
        />
      )}
      {!!data.cycles.length && !shown.length && (
        <p>
          {ar ? "لا توجد دورات تطابق الفلتر." : "No cycles match this filter."}
        </p>
      )}
      {!data.cycles.length && (
        <p className="rounded-xl border border-dashed p-8 text-center">
          {ar
            ? "لا توجد دورات متاحة لك في هذه الشركة."
            : "No cycles are available to you in this company."}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((c) => {
          const own = data.tasks.find((t) => t.cycle_id === c.id);
          return (
            <button
              key={c.id}
              onClick={() => setSelected(c.id)}
              className={`rounded-xl border p-4 text-start space-y-2 ${selected === c.id ? "border-primary bg-primary/5" : "bg-card"}`}
              aria-pressed={selected === c.id}
            >
              <strong className="block">{c.title}</strong>
              {c.title.startsWith("[تجريبي]") && (
                <span className="block text-xs text-amber-700 dark:text-amber-400">
                  {ar ? "بيانات للتجربة فقط" : "Demo only"}
                </span>
              )}
              <span className="block">{c.subject_name}</span>
              <span className="text-sm text-muted-foreground">
                {
                  {
                    draft: ar ? "مسودة" : "Draft",
                    open: ar ? "مفتوحة" : "Open",
                    closed: ar ? "مغلقة" : "Closed",
                  }[c.status]
                }
              </span>
              {own && (
                <span className="block text-sm">
                  {label(own.relationship)} ·{" "}
                  {own.submitted
                    ? ar
                      ? "تم تسليم تقييمك"
                      : "Your review submitted"
                    : ar
                      ? "لم تسلّم تقييمك"
                      : "Not submitted"}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {cycle && (
        <section key={cycle.id} className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>
                {cycle.title} — {cycle.subject_name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                {ar ? "فترة الأداء" : "Performance period"}:{" "}
                {cycle.period_start} → {cycle.period_end}
              </p>
              <p>
                {ar ? "آخر موعد للإجابات" : "Submission deadline"}:{" "}
                {new Date(cycle.deadline).toLocaleString(
                  ar ? "ar-EG" : "en-US",
                )}
              </p>
              <p>
                {ar
                  ? "المعايير والمشاركون ثابتون بعد فتح الدورة. لا يمكن إعادة فتحها أو تعديل الإجابات المسلّمة."
                  : "Criteria and participants are frozen once opened. Cycles cannot be reopened and submitted answers cannot be edited."}
              </p>
              <ul className="space-y-2">
                {cycle.criteria.map((c) => (
                  <li key={c.id}>
                    <strong>
                      {c.title} ({c.weight}%)
                    </strong>{" "}
                    — {c.description}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          {data.can_manage && cycle.status === "draft" && (
            <Button
              variant="outline"
              onClick={() => {
                setEditing(cycle);
                setCreating(false);
              }}
            >
              {ar
                ? "تعديل معايير وفترة المسودة"
                : "Edit draft criteria and period"}
            </Button>
          )}
          {data.can_manage && (
            <ManageCycle
              companyId={companyId}
              userId={userId}
              cycle={cycle}
              members={data.members}
              ar={ar}
              pending={mutation.isPending}
              act={act}
            />
          )}
          {task && cycle.status === "open" && !task.submitted && (
            <AnswerCycle
              key={task.id}
              cycle={cycle}
              task={task}
              ar={ar}
              pending={mutation.isPending}
              submit={(p) => act("submit", p)}
            />
          )}
          {task?.submitted && (
            <p role="status">
              {ar
                ? "تم تسليم تقييمك من حسابك. لا يمكن تعديل الرد بعد التسليم."
                : "Your account submitted this review. It cannot be changed after submission."}
            </p>
          )}
          {cycle.status === "closed" &&
            (data.can_manage || cycle.is_subject) && (
              <Report
                companyId={companyId}
                userId={userId}
                cycleId={cycle.id}
                ar={ar}
              />
            )}
        </section>
      )}
    </>
  );
}

function CreateCycle({
  ar,
  members,
  pending,
  submit,
  existing,
  cancel,
}: {
  ar: boolean;
  members: CycleList["members"];
  pending: boolean;
  submit: (p: Json) => void;
  existing?: Cycle;
  cancel?: () => void;
}) {
  const [criteria, setCriteria] = useState<Criterion[]>(
    () => existing?.criteria.map((c) => ({ ...c })) || defaultCriteria(ar),
  );
  const [error, setError] = useState("");
  const total = criteria.reduce((s, c) => s + c.weight, 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {existing
            ? ar
              ? "تعديل المسودة"
              : "Edit draft"
            : ar
              ? "إعداد دورة جديدة"
              : "Set up a new cycle"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setError("");
            const form = new FormData(e.currentTarget);
            if (
              total !== 100 ||
              criteria.some(
                (c) =>
                  !c.title.trim() ||
                  !c.description.trim() ||
                  !Number.isFinite(c.weight) ||
                  c.weight < 1 ||
                  c.weight > 100,
              )
            ) {
              setError(
                ar
                  ? "أكمل المعايير واجعل مجموع الأوزان مائة."
                  : "Complete criteria with weights totaling 100.",
              );
              return;
            }
            const deadline = new Date(String(form.get("deadline")));
            if (
              !Number.isFinite(deadline.getTime()) ||
              deadline.getTime() <= Date.now()
            ) {
              setError(
                ar
                  ? "اختر موعدًا نهائيًا في المستقبل."
                  : "Choose a future deadline.",
              );
              return;
            }
            submit({
              ...(existing
                ? { cycle_id: existing.id, version: existing.version || 1 }
                : {}),
              title: String(form.get("title")).trim(),
              subject_id: existing?.subject_id || String(form.get("subject")),
              period_start: String(form.get("start")),
              period_end: String(form.get("end")),
              deadline: deadline.toISOString(),
              criteria: criteria.map((c) => ({ ...c })),
            });
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span>{ar ? "عنوان الدورة" : "Cycle title"}</span>
              <Input
                name="title"
                required
                maxLength={160}
                defaultValue={existing?.title}
              />
            </label>
            <label className="space-y-2">
              <span>{ar ? "الموظف المعني" : "Review subject"}</span>
              <select
                name="subject"
                className={selectClass}
                required
                disabled={!!existing}
                defaultValue={existing?.subject_id || ""}
              >
                <option value="">
                  {ar ? "اختر موظفًا" : "Select a member"}
                </option>
                {members.map((m) => (
                  <option key={m.user_id} value={m.user_id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span>{ar ? "بداية فترة الأداء" : "Period start"}</span>
              <Input
                type="date"
                name="start"
                required
                defaultValue={
                  existing?.period_start || localDay().slice(0, 8) + "01"
                }
              />
            </label>
            <label className="space-y-2">
              <span>{ar ? "نهاية فترة الأداء" : "Period end"}</span>
              <Input
                type="date"
                name="end"
                required
                defaultValue={existing?.period_end || localDay()}
              />
            </label>
            <label className="space-y-2">
              <span>
                {ar ? "الموعد النهائي للإجابات" : "Submission deadline"}
              </span>
              <Input
                type="datetime-local"
                name="deadline"
                required
                defaultValue={
                  existing
                    ? new Date(
                        new Date(existing.deadline).getTime() -
                          new Date(existing.deadline).getTimezoneOffset() *
                            60000,
                      )
                        .toISOString()
                        .slice(0, 16)
                    : undefined
                }
              />
            </label>
          </div>
          <p className="text-sm text-muted-foreground">
            {ar
              ? "عدّل المعايير لتناسب الوظيفة، واكتب سلوكًا يمكن ملاحظته. الأوزان ثابتة لهذه الدورة ومجموعها مائة."
              : "Adapt criteria to the role using observable behavior. Weights are frozen for this cycle and must total 100."}
          </p>
          {criteria.map((c, i) => (
            <fieldset
              key={c.id}
              className="grid gap-3 rounded-lg border p-3 md:grid-cols-[1fr_2fr_100px]"
            >
              <label>
                <span>
                  {ar ? "المعيار" : "Criterion"} {i + 1}
                </span>
                <Input
                  required
                  maxLength={120}
                  value={c.title}
                  onChange={(e) =>
                    setCriteria(
                      criteria.map((x, j) =>
                        j === i ? { ...x, title: e.target.value } : x,
                      ),
                    )
                  }
                />
              </label>
              <label>
                <span>
                  {ar ? "السلوك المتوقع" : "Expected behavior"} {i + 1}
                </span>
                <Input
                  required
                  maxLength={600}
                  value={c.description}
                  onChange={(e) =>
                    setCriteria(
                      criteria.map((x, j) =>
                        j === i ? { ...x, description: e.target.value } : x,
                      ),
                    )
                  }
                />
              </label>
              <label>
                <span>
                  {ar ? "الوزن" : "Weight"} {i + 1}
                </span>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  required
                  value={c.weight}
                  onChange={(e) =>
                    setCriteria(
                      criteria.map((x, j) =>
                        j === i ? { ...x, weight: Number(e.target.value) } : x,
                      ),
                    )
                  }
                />
              </label>
            </fieldset>
          ))}
          <p>
            {ar ? "مجموع الأوزان" : "Total weight"}: {total}%
          </p>
          {error && (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          )}
          <Button
            type="submit"
            disabled={pending || !members.length || total !== 100}
          >
            {ar ? "حفظ المسودة" : "Save draft"}
          </Button>
          {cancel && (
            <Button type="button" variant="ghost" onClick={cancel}>
              {ar ? "إلغاء التعديل" : "Cancel edit"}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

function ManageCycle({
  companyId,
  userId,
  cycle,
  members,
  ar,
  pending,
  act,
}: {
  companyId: string;
  userId: string;
  cycle: Cycle;
  members: CycleList["members"];
  ar: boolean;
  pending: boolean;
  act: (action: string, payload: Json) => void;
}) {
  const [reviewer, setReviewer] = useState("");
  const [relation, setRelation] = useState("peers");
  const [confirm, setConfirm] = useState<"open" | "close" | null>(null);
  const roster = useQuery({
    queryKey: ["performance360", companyId, userId, "roster", cycle.id],
    queryFn: () =>
      cycleRequest<RosterMember[]>(companyId, "roster", { cycle_id: cycle.id }),
  });
  const readiness = cycleReadiness(roster.data || [], members, cycle.deadline);
  const issues: Record<string, [string, string]> = {
    external: [
      "أضف مقيّمًا خارجيًا واحدًا على الأقل غير صاحب التقييم.",
      "Add at least one reviewer other than the subject.",
    ],
    peers: [
      "فئة الزملاء تحتاج ثلاثة مشاركين على الأقل.",
      "Peers require at least three participants.",
    ],
    subordinates: [
      "فئة المرؤوسين تحتاج ثلاثة مشاركين على الأقل.",
      "Direct reports require at least three participants.",
    ],
    inactive: [
      "يوجد مشارك غير نشط أو غادر الشركة؛ راجع القائمة.",
      "A participant is inactive or left the company; review the roster.",
    ],
    deadline: [
      "عدّل الموعد النهائي إلى وقت مستقبلي قبل الفتح.",
      "Edit the draft deadline to a future time before opening.",
    ],
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {ar ? "إدارة المشاركين والدورة" : "Manage participants and cycle"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {roster.isPending ? (
          <p role="status">
            {ar ? "جارٍ تحميل المشاركين…" : "Loading participants…"}
          </p>
        ) : roster.isError ? (
          <p role="alert">
            {ar
              ? "تعذّر تحميل المشاركين. حدّث الصفحة."
              : "Could not load participants. Refresh the page."}
          </p>
        ) : (
          <ul className="space-y-2">
            {roster.data.map((m) => (
              <li
                className="flex items-center justify-between gap-3"
                key={m.id}
              >
                <span>
                  {m.name} — {groupLabels[m.relationship][ar ? 0 : 1]}
                </span>
                {cycle.status === "draft" && m.relationship !== "self" && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pending}
                    onClick={() =>
                      act("remove", {
                        cycle_id: cycle.id,
                        reviewer_id: m.reviewer_id,
                      })
                    }
                  >
                    {ar ? "إزالة" : "Remove"}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
        {cycle.status === "draft" && (
          <>
            <div className="grid gap-3 md:grid-cols-3">
              <label>
                <span>{ar ? "المشارك" : "Participant"}</span>
                <select
                  className={selectClass}
                  value={reviewer}
                  onChange={(e) => setReviewer(e.target.value)}
                >
                  <option value="">
                    {ar ? "اختر مشاركًا" : "Select participant"}
                  </option>
                  {members
                    .filter(
                      (m) =>
                        m.user_id !== cycle.subject_id &&
                        !roster.data?.some((r) => r.reviewer_id === m.user_id),
                    )
                    .map((m) => (
                      <option key={m.user_id} value={m.user_id}>
                        {m.name}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                <span>
                  {ar ? "العلاقة بالموظف" : "Relationship to subject"}
                </span>
                <select
                  className={selectClass}
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                >
                  {reviewGroups
                    .filter((g) => g !== "self")
                    .map((g) => (
                      <option key={g} value={g}>
                        {groupLabels[g][ar ? 0 : 1]}
                      </option>
                    ))}
                </select>
              </label>
              <Button
                className="self-end"
                disabled={
                  pending || !reviewer || roster.isError || roster.isPending
                }
                onClick={() => {
                  act("assign", {
                    cycle_id: cycle.id,
                    reviewer_id: reviewer,
                    relationship: relation,
                  });
                  setReviewer("");
                }}
              >
                {ar ? "إضافة مشارك" : "Add participant"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {ar
                ? "التقييم الذاتي يُضاف تلقائيًا. مدير واحد كحد أقصى، وثلاثة مشاركين على الأقل لأي فئة سرية تختار إضافتها. التكليف يظهر داخل حساب المشارك؛ لا تُرسل رسائل بريد تلقائية."
                : "Self review is added automatically. Assign at most one manager and at least three participants in any confidential group you use. Assignments appear in participants’ accounts; no automatic emails are sent."}
            </p>
            {readiness.length > 0 && (
              <ul
                role="status"
                className="space-y-2 rounded-lg border border-amber-500/40 p-3 text-sm"
              >
                {readiness.map((r) => (
                  <li key={r}>{issues[r][ar ? 0 : 1]}</li>
                ))}
              </ul>
            )}
            <Button
              disabled={
                pending ||
                roster.isError ||
                roster.isPending ||
                readiness.length > 0
              }
              onClick={() => setConfirm("open")}
            >
              {ar ? "فتح الدورة للمشاركين" : "Open cycle for participants"}
            </Button>
          </>
        )}
        {cycle.status === "open" && (
          <Button
            variant="outline"
            disabled={pending}
            onClick={() => setConfirm("close")}
          >
            {ar
              ? "إغلاق الدورة وإظهار النتائج"
              : "Close cycle and release results"}
          </Button>
        )}
        {confirm && cycle.status !== "closed" && (
          <div
            role="alert"
            className="space-y-3 rounded-lg border border-amber-500 p-4"
          >
            <p>
              {confirm === "open"
                ? ar
                  ? "بعد الفتح، لا يمكن تعديل المعايير أو المشاركين. تأكد من صحة العلاقات والمواعيد."
                  : "Opening freezes criteria and participants. Verify relationships and dates."
                : ar
                  ? "الإغلاق يمنع أي إجابات جديدة ويثبت النتائج الحالية حتى لو لم يرد الجميع. لا يمكن إعادة الفتح."
                  : "Closing stops submissions and permanently freezes current results, even if some participants have not responded. It cannot be reopened."}
            </p>
            <div className="flex gap-3">
              <Button
                disabled={pending}
                onClick={() => {
                  act(confirm, { cycle_id: cycle.id });
                  setConfirm(null);
                }}
              >
                {ar ? "تأكيد" : "Confirm"}
              </Button>
              <Button variant="outline" onClick={() => setConfirm(null)}>
                {ar ? "إلغاء" : "Cancel"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AnswerCycle({
  cycle,
  task,
  ar,
  pending,
  submit,
}: {
  cycle: Cycle;
  task: ReviewTask;
  ar: boolean;
  pending: boolean;
  submit: (p: Json) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const expired = new Date(cycle.deadline).getTime() <= Date.now();
  const anchors = ar
    ? [
        "أقل بكثير من التوقعات",
        "يحقق بعض التوقعات",
        "يحقق التوقعات",
        "يتجاوز التوقعات غالبًا",
        "يتجاوز التوقعات باستمرار",
      ]
    : [
        "Well below expectations",
        "Partly meets expectations",
        "Meets expectations",
        "Often exceeds expectations",
        "Consistently exceeds expectations",
      ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {ar ? "تقييمك المستقل" : "Your independent review"} —{" "}
          {groupLabels[task.relationship][ar ? 0 : 1]}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {expired ? (
          <p role="status">
            {ar
              ? "انتهى موعد الإجابات."
              : "The submission deadline has passed."}
          </p>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const scores = scorePayload(cycle.criteria, answers);
              if (!scores || !confirmed) {
                setError(
                  ar
                    ? "أجب عن كل معيار أو اختر لم ألاحظ، وأكّد التسليم."
                    : "Answer each criterion or choose not observed, and confirm submission.",
                );
                return;
              }
              setError("");
              submit({ cycle_id: cycle.id, assignment_id: task.id, scores });
            }}
          >
            <p className="text-sm">
              {ar
                ? "قيّم السلوك خلال الفترة المحددة فقط. اختر «لم ألاحظ» عندما لا تتوفر لديك أمثلة كافية؛ لن تُحسب كصفر. هذا مقياس إرشادي يحدده سياق الوظيفة."
                : "Rate observed behavior during the stated period. Choose “Not observed” when you lack sufficient evidence; it is not counted as zero. This is an illustrative role-dependent scale."}
            </p>
            {cycle.criteria.map((c) => (
              <div key={c.id} className="space-y-2">
                <Label htmlFor={`answer-${c.id}`}>
                  {c.title} ({c.weight}%)
                </Label>
                <p className="text-sm text-muted-foreground">{c.description}</p>
                <select
                  id={`answer-${c.id}`}
                  className={selectClass}
                  value={answers[c.id] || ""}
                  required
                  onChange={(e) =>
                    setAnswers({ ...answers, [c.id]: e.target.value })
                  }
                >
                  <option value="">
                    {ar ? "اختر إجابة" : "Choose an answer"}
                  </option>
                  {anchors.map((text, i) => (
                    <option key={i} value={i + 1}>
                      {i + 1} — {text}
                    </option>
                  ))}
                  <option value="na">
                    {ar
                      ? "لم ألاحظ / لا ينطبق"
                      : "Not observed / not applicable"}
                  </option>
                </select>
              </div>
            ))}
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
              <span>
                {ar
                  ? "راجعت إجاباتي وأعلم أن التسليم نهائي من حسابي."
                  : "I reviewed my answers and understand this submission is final and linked to my account."}
              </span>
            </label>
            {error && (
              <p role="alert" className="text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" disabled={pending || !confirmed}>
              {ar ? "تسليم التقييم" : "Submit review"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

function Report({
  companyId,
  userId,
  cycleId,
  ar,
}: {
  companyId: string;
  userId: string;
  cycleId: string;
  ar: boolean;
}) {
  const q = useQuery({
    queryKey: ["performance360", companyId, userId, "report", cycleId],
    queryFn: () =>
      cycleRequest<CycleReport>(companyId, "report", { cycle_id: cycleId }),
  });
  if (q.isPending)
    return (
      <p role="status">{ar ? "جارٍ تحميل التقرير…" : "Loading report…"}</p>
    );
  if (q.isError)
    return (
      <p role="alert">
        {ar
          ? "تعذّر تحميل التقرير. حدّث الصفحة للتحقق من الصلاحية."
          : "Could not load the report. Refresh to verify access."}
      </p>
    );
  const r = q.data;
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {ar
            ? "النتيجة المجمّعة للدورة المغلقة"
            : "Closed-cycle aggregate report"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button asChild variant="outline">
          <Link to={`/tasks?action=new&cycle=${cycleId}`}>
            {ar
              ? "إنشاء مهمة تطوير من المناقشة"
              : "Create a development follow-up task"}
          </Link>
        </Button>
        <p className="text-2xl font-bold">
          {ar ? "المتوسط الخارجي" : "External feedback average"}:{" "}
          {scoreLabel(r.overall)} / 5
        </p>
        <p>
          {ar
            ? "تغطية أوزان المعايير المتاحة"
            : "Available criterion weight coverage"}
          : {r.available_weight}%
        </p>
        <p className="text-sm text-muted-foreground">
          {ar
            ? "المتوسط يستبعد التقييم الذاتي. داخل كل معيار تتساوى أوزان الفئات الخارجية التي يمكن عرضها، ثم تطبّق أوزان المعايير المتاحة فقط. علامة — تعني عدم وجود ردود كافية أو حجب الفئة لحماية السرية؛ ليست صفرًا."
            : "Self ratings are excluded. Displayable external groups have equal weight within each criterion; the available criterion weights then apply. — means unavailable or privacy-suppressed, never zero."}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="p-2 text-start">
                  {ar ? "المعيار" : "Criterion"}
                </th>
                {reviewGroups.map((g) => (
                  <th className="p-2" key={g}>
                    {groupLabels[g][ar ? 0 : 1]}
                  </th>
                ))}
                <th className="p-2">{ar ? "الخارجي" : "External"}</th>
              </tr>
            </thead>
            <tbody>
              {r.criteria.map((c) => (
                <tr key={c.id} className="border-t">
                  <th className="p-2 text-start font-medium">
                    {c.title} ({c.weight}%)
                  </th>
                  {reviewGroups.map((g) => (
                    <td key={g} className="p-2 text-center">
                      {scoreLabel(c.groups[g])}
                    </td>
                  ))}
                  <td className="p-2 text-center">{scoreLabel(c.external)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="text-sm space-y-1">
          {reviewGroups.map((g) => (
            <li key={g}>
              {groupLabels[g][ar ? 0 : 1]}: {r.groups[g].submitted} /{" "}
              {r.groups[g].assigned}{" "}
              {ar ? "إجابات مسلّمة من التكليفات" : "submitted assignments"}
            </li>
          ))}
        </ul>
        <p className="text-sm">
          {ar
            ? "غياب فئة أو حجبها يجعل النتيجة جزئية. عند الإغلاق تُستبعد درجات من غادروا الشركة. لا تقارن دورات مختلفة المعايير أو التغطية على أنها متماثلة."
            : "Missing or suppressed groups make this a partial result. Scores from departed members are excluded at closing. Cycles with different criteria or coverage are not directly comparable."}
        </p>
      </CardContent>
    </Card>
  );
}
