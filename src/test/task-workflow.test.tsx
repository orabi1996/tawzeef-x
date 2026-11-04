import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { TaskWorkspace } from "@/pages/TaskBoard";
import {
  taskOverdue,
  taskReady,
  taskTransitions,
  type WorkflowTask,
  type TaskWorkspaceData,
} from "@/lib/taskWorkflow";
const { rpc, toast } = vi.hoisted(() => ({ rpc: vi.fn(), toast: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc } }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));
vi.mock("@/components/DashboardLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));
const task: WorkflowTask = {
  id: "task-a",
  title: "Verify interview plan",
  description: "Confirm the agreed scope",
  expected_outcome: "A verified interview schedule",
  user_id: "owner",
  assignee_id: "worker",
  assignee_name: "Assigned member",
  reviewer_id: "reviewer",
  reviewer_name: "Review member",
  due_date: "2099-01-01",
  priority: "high",
  column_status: "in_progress",
  completion_note: "",
  blocked_reason: "",
  subtasks: [],
  version: 4,
  archived_at: null,
  completed_at: null,
  job_id: null,
  candidate_id: null,
  cycle_id: null,
  events: [],
};
const fixture: TaskWorkspaceData = {
  tasks: [task],
  can_manage: false,
  members: [
    { id: "worker", name: "Assigned member" },
    { id: "reviewer", name: "Review member" },
    { id: "owner", name: "Company owner" },
  ],
  jobs: [],
  candidates: [],
  cycles: [],
  legacy: [],
};
function mount(data = fixture, userId = "worker") {
  rpc.mockResolvedValue({ data, error: null });
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const view = render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <TaskWorkspace companyId="company-a" userId={userId} ar={false} />
      </QueryClientProvider>
    </MemoryRouter>,
  );
  return { client, ...view };
}
async function openTask() {
  fireEvent.click(
    await screen.findByRole("button", { name: /Verify interview plan/ }),
  );
}
afterEach(cleanup);
beforeEach(() => vi.clearAllMocks());
describe("company task workflow", () => {
  it("scopes requests and uses assigned accounts without fabricated data", async () => {
    mount();
    await screen.findByRole("button", { name: /Verify interview plan/ });
    expect(rpc).toHaveBeenCalledWith("task_workflow", {
      _company_id: "company-a",
      _action: "list",
      _payload: { archived: false },
    });
    expect(
      screen.queryByText(/AI-generated|أحمد الحربي|85%/),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "New task" }));
    expect(screen.getByLabelText("Assignee")).toHaveValue("worker");
    expect(
      screen.getByLabelText("Assignee").querySelectorAll("option"),
    ).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Save task" })).toBeDisabled();
  });
  it("creates with a real member id, explicit outcome and optional independent reviewer", async () => {
    mount({ ...fixture, can_manage: true }, "owner");
    fireEvent.click(await screen.findByRole("button", { name: "New task" }));
    fireEvent.change(screen.getByLabelText("Task title"), {
      target: { value: "Plan hiring interviews" },
    });
    fireEvent.change(
      screen.getByLabelText("Expected outcome and acceptance criteria"),
      { target: { value: "Interview schedule approved" } },
    );
    fireEvent.change(screen.getByLabelText("Assignee"), {
      target: { value: "worker" },
    });
    fireEvent.change(screen.getByLabelText("Reviewer"), {
      target: { value: "reviewer" },
    });
    rpc.mockImplementation((_n, a) =>
      Promise.resolve({
        data: a._action === "list" ? fixture : { id: "task-new" },
        error: null,
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Save task" }));
    await waitFor(() =>
      expect(rpc).toHaveBeenCalledWith(
        "task_workflow",
        expect.objectContaining({
          _action: "create",
          _payload: expect.objectContaining({
            title: "Plan hiring interviews",
            assignee_id: "worker",
            reviewer_id: "reviewer",
            expected_outcome: "Interview schedule approved",
          }),
        }),
      ),
    );
    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith({ title: "Change saved" }),
    );
  });
  it("requires actual delivery evidence and saves work before a transition", async () => {
    mount();
    await openTask();
    expect(
      screen.getByRole("button", { name: "Submit for review" }),
    ).toBeDisabled();
    expect(
      screen.queryByRole("button", { name: "Approve and complete" }),
    ).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Delivery result / evidence"), {
      target: { value: "Completed schedule reviewed" },
    });
    expect(
      screen.getByRole("button", { name: "Submit for review" }),
    ).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Task comment"), {
      target: { value: "Comment must not discard pending work" },
    });
    expect(screen.getByRole("button", { name: "Add comment" })).toBeDisabled();
    rpc.mockImplementation((_n, a) =>
      Promise.resolve({
        data:
          a._action === "list"
            ? {
                ...fixture,
                tasks: [
                  {
                    ...task,
                    completion_note: "Completed schedule reviewed",
                    version: 5,
                  },
                ],
              }
            : { id: task.id },
        error: null,
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Save work update" }));
    await waitFor(() =>
      expect(rpc).toHaveBeenCalledWith("task_workflow", {
        _company_id: "company-a",
        _action: "work",
        _payload: {
          id: task.id,
          version: 4,
          subtasks: [],
          completion_note: "Completed schedule reviewed",
          blocked_reason: "",
        },
      }),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Submit for review" }),
      ).toBeEnabled(),
    );
  });
  it("preserves the local work draft when another session updates the task", async () => {
    const { client } = mount();
    await openTask();
    fireEvent.change(screen.getByLabelText("Delivery result / evidence"), {
      target: { value: "My unsaved evidence" },
    });
    rpc.mockResolvedValue({
      data: {
        ...fixture,
        tasks: [
          { ...task, version: 5, completion_note: "Other session evidence" },
        ],
      },
      error: null,
    });
    await client.invalidateQueries({
      queryKey: ["task-workflow", "company-a", "worker"],
    });
    expect(
      await screen.findByRole("button", { name: "Load latest version" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Delivery result / evidence")).toHaveValue(
      "My unsaved evidence",
    );
    rpc.mockImplementation((_n, a) =>
      Promise.resolve(
        a._action === "work"
          ? { data: null, error: { message: "TASK_CONFLICT: refresh" } }
          : {
              data: { ...fixture, tasks: [{ ...task, version: 5 }] },
              error: null,
            },
      ),
    );
    fireEvent.click(screen.getByRole("button", { name: "Save work update" }));
    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Change was not saved",
          variant: "destructive",
        }),
      ),
    );
    expect(screen.getByLabelText("Delivery result / evidence")).toHaveValue(
      "My unsaved evidence",
    );
    expect(toast).not.toHaveBeenCalledWith({ title: "Change saved" });
  });
  it("only exposes approval to the assigned reviewer and requires a reason for revisions", async () => {
    mount(
      {
        ...fixture,
        tasks: [
          { ...task, column_status: "in_review", completion_note: "Evidence" },
        ],
      },
      "reviewer",
    );
    await openTask();
    expect(screen.getByLabelText("Delivery result / evidence")).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Approve and complete" }),
    ).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Request revision" }));
    expect(
      screen.getByRole("button", { name: "Confirm action" }),
    ).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Reason for returning"), {
      target: { value: "Please verify the final dates" },
    });
    rpc.mockImplementation((_n, a) =>
      Promise.resolve({
        data:
          a._action === "list"
            ? {
                ...fixture,
                tasks: [{ ...task, column_status: "in_progress", version: 5 }],
              }
            : { id: task.id },
        error: null,
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Confirm action" }));
    await waitFor(() =>
      expect(rpc).toHaveBeenCalledWith("task_workflow", {
        _company_id: "company-a",
        _action: "transition",
        _payload: {
          id: task.id,
          version: 4,
          status: "in_progress",
          reason: "Please verify the final dates",
        },
      }),
    );
  });
  it("filters my review queue and requests archive separately", async () => {
    mount(
      {
        ...fixture,
        tasks: [
          task,
          {
            ...task,
            id: "task-b",
            title: "Review submitted work",
            column_status: "in_review",
          },
        ],
      },
      "reviewer",
    );
    await screen.findByRole("button", { name: /Verify interview plan/ });
    fireEvent.change(screen.getByLabelText("Task filter"), {
      target: { value: "review" },
    });
    expect(
      screen.queryByRole("button", { name: /Verify interview plan/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Review submitted work/ }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Archive" }));
    await waitFor(() =>
      expect(rpc).toHaveBeenCalledWith("task_workflow", {
        _company_id: "company-a",
        _action: "list",
        _payload: { archived: true },
      }),
    );
  });
  it("does not replace failed loading with sample tasks", async () => {
    mount();
    rpc.mockResolvedValue({
      data: null,
      error: { message: "permission denied" },
    });
    fireEvent.click(await screen.findByRole("button", { name: "Refresh" }));
    expect(
      await screen.findByText("Could not load tasks."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Verify interview plan/ }),
    ).not.toBeInTheDocument();
  });
});
describe("task action and date rules", () => {
  it("never lets an administrator approve for the assigned reviewer", () => {
    expect(
      taskTransitions({ ...task, column_status: "in_review" }, "owner", true),
    ).toEqual(["todo"]);
    expect(
      taskTransitions(
        { ...task, column_status: "in_review" },
        "reviewer",
        false,
      ),
    ).toEqual(["done", "in_progress"]);
    expect(
      taskTransitions({ ...task, archived_at: "2026-01-01" }, "worker", false),
    ).toEqual([]);
    expect(
      taskTransitions({ ...task, reviewer_id: null }, "worker", false),
    ).toEqual(["todo", "done"]);
  });
  it("uses evidence and real checklist completion rather than arbitrary percentages", () => {
    expect(taskReady(task)).toBe(false);
    expect(taskReady({ ...task, completion_note: "Evidence" })).toBe(true);
    expect(
      taskReady({
        ...task,
        completion_note: "Evidence",
        blocked_reason: "Files needed",
      }),
    ).toBe(false);
    expect(
      taskReady({
        ...task,
        completion_note: "Evidence",
        subtasks: [{ id: "1", title: "Verify", completed: false }],
      }),
    ).toBe(false);
  });
  it("treats today as on time and excludes completed or archived work from overdue", () => {
    const t = { ...task, due_date: "2026-10-28" };
    expect(taskOverdue(t, "2026-10-28")).toBe(false);
    expect(taskOverdue(t, "2026-10-29")).toBe(true);
    expect(taskOverdue({ ...t, column_status: "done" }, "2026-10-29")).toBe(
      false,
    );
    expect(taskOverdue({ ...t, archived_at: "2026-10-28" }, "2026-10-29")).toBe(
      false,
    );
  });
});
