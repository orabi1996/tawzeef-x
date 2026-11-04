import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CycleWorkspace, AnswerCycle } from "@/pages/Performance360";
import {
  cycleReadiness,
  defaultCriteria,
  scorePayload,
  type Cycle,
  type CycleList,
} from "@/lib/performance360";
const { rpc, toast } = vi.hoisted(() => ({ rpc: vi.fn(), toast: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc } }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));
vi.mock("@/components/DashboardLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));
const cycle: Cycle = {
  id: "cycle-a",
  title: "Quarter review",
  subject_id: "subject",
  subject_name: "Subject",
  period_start: "2026-01-01",
  period_end: "2026-03-31",
  deadline: "2099-04-15T12:00:00Z",
  status: "open",
  criteria: defaultCriteria(false),
  is_subject: false,
};
const fixture: CycleList = {
  can_manage: false,
  cycles: [cycle],
  tasks: [
    {
      id: "assignment-a",
      cycle_id: cycle.id,
      relationship: "peers",
      submitted: false,
    },
  ],
  members: [],
};
function mount(data: CycleList = fixture) {
  rpc.mockResolvedValue({ data, error: null });
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <CycleWorkspace companyId="company-a" userId="user-a" ar={false} />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}
afterEach(cleanup);
beforeEach(() => vi.clearAllMocks());
describe("360 questionnaire integrity", () => {
  it("starts unanswered, permits explicit not-observed, rejects empty and invalid scores", () => {
    const criteria = defaultCriteria(false);
    expect(scorePayload(criteria, {})).toBeNull();
    const answers = Object.fromEntries(criteria.map((c) => [c.id, "na"]));
    expect(scorePayload(criteria, answers)).toEqual(
      Object.fromEntries(criteria.map((c) => [c.id, null])),
    );
    answers.delivery = "5";
    expect(scorePayload(criteria, answers)).toEqual({
      delivery: 5,
      collaboration: null,
      communication: null,
      expertise: null,
      ownership: null,
    });
    for (const value of ["0", "6", "4.5", "NaN", " 4", ""]) {
      answers.delivery = value;
      expect(scorePayload(criteria, answers)).toBeNull();
    }
  });
  it("requires confirmation and sends the assigned identity and explicit scores", () => {
    const submit = vi.fn();
    render(
      <AnswerCycle
        cycle={cycle}
        task={fixture.tasks[0]}
        ar={false}
        pending={false}
        submit={submit}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Submit review" }),
    ).toBeDisabled();
    for (const select of screen.getAllByRole("combobox"))
      expect(select).toHaveValue("");
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.submit(
      screen.getByRole("button", { name: "Submit review" }).closest("form")!,
    );
    expect(submit).not.toHaveBeenCalled();
    for (const select of screen.getAllByRole("combobox"))
      fireEvent.change(select, { target: { value: "4" } });
    fireEvent.submit(
      screen.getByRole("button", { name: "Submit review" }).closest("form")!,
    );
    expect(submit).toHaveBeenCalledWith({
      cycle_id: "cycle-a",
      assignment_id: "assignment-a",
      scores: Object.fromEntries(cycle.criteria.map((c) => [c.id, 4])),
    });
  });
  it("closes the submission form after the deadline", () => {
    render(
      <AnswerCycle
        cycle={{ ...cycle, deadline: "2000-01-01T00:00:00Z" }}
        task={fixture.tasks[0]}
        ar={false}
        pending={false}
        submit={vi.fn()}
      />,
    );
    expect(
      screen.getByText("The submission deadline has passed."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Submit review" }),
    ).not.toBeInTheDocument();
  });
  it("requests only the active company and hides administration from participants", async () => {
    mount();
    await screen.findByText("Quarter review");
    expect(rpc).toHaveBeenCalledWith("performance360", {
      _company_id: "company-a",
      _action: "list",
      _payload: {},
    });
    expect(
      screen.queryByRole("button", { name: "Create cycle" }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Quarter review/ }));
    expect(
      screen.queryByText("Manage participants and cycle"),
    ).not.toBeInTheDocument();
    expect(rpc.mock.calls.every((c) => c[1]._action === "list")).toBe(true);
  });
  it("never requests an unreleased report or another participant roster", async () => {
    mount({ ...fixture, cycles: [{ ...cycle, status: "closed" }] });
    await screen.findByText("Quarter review");
    fireEvent.click(screen.getByRole("button", { name: /Quarter review/ }));
    expect(
      screen.queryByText("Closed-cycle aggregate report"),
    ).not.toBeInTheDocument();
    expect(rpc.mock.calls.every((c) => c[1]._action === "list")).toBe(true);
  });
  it("displays a genuine empty state", async () => {
    mount({ can_manage: false, cycles: [], tasks: [], members: [] });
    expect(
      await screen.findByText(
        "No cycles are available to you in this company.",
      ),
    ).toBeInTheDocument();
  });
  it("reloads a cached empty list when returning after cycles were added elsewhere", async () => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 300_000,
          refetchOnMount: false,
          refetchOnWindowFocus: false,
        },
      },
    });
    client.setQueryData(["performance360", "company-a", "user-a"], {
      can_manage: true,
      cycles: [],
      tasks: [],
      members: [],
    });
    rpc.mockResolvedValue({
      data: { ...fixture, can_manage: true },
      error: null,
    });
    render(
      <MemoryRouter>
        <QueryClientProvider client={client}>
          <CycleWorkspace companyId="company-a" userId="user-a" ar={false} />
        </QueryClientProvider>
      </MemoryRouter>,
    );
    expect(await screen.findByText("Quarter review")).toBeInTheDocument();
    expect(
      screen.queryByText("No cycles are available to you in this company."),
    ).not.toBeInTheDocument();
  });
  it("disables draft creation when criterion weights do not total 100", async () => {
    mount({
      can_manage: true,
      cycles: [],
      tasks: [],
      members: [{ user_id: "subject", name: "Subject" }],
    });
    fireEvent.click(
      await screen.findByRole("button", { name: "Create cycle" }),
    );
    fireEvent.change(screen.getByLabelText("Weight 1"), {
      target: { value: "10" },
    });
    expect(screen.getByRole("button", { name: "Save draft" })).toBeDisabled();
  });
  it("only shows a report returned by the server to an authorized subject", async () => {
    mount({
      ...fixture,
      cycles: [{ ...cycle, status: "closed", is_subject: true }],
    });
    await screen.findByText("Quarter review");
    rpc.mockImplementation((_name, args) =>
      Promise.resolve({
        data:
          args._action === "report"
            ? {
                overall: null,
                available_weight: 0,
                closed_at: "2026-01-01",
                criteria: [],
                groups: {
                  self: { assigned: 1, submitted: 0 },
                  manager: { assigned: 0, submitted: 0 },
                  peers: { assigned: 3, submitted: 2 },
                  subordinates: { assigned: 0, submitted: 0 },
                },
              }
            : fixture,
        error: null,
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: /Quarter review/ }));
    await screen.findByText("Closed-cycle aggregate report");
    await waitFor(() =>
      expect(rpc).toHaveBeenCalledWith("performance360", {
        _company_id: "company-a",
        _action: "report",
        _payload: { cycle_id: "cycle-a" },
      }),
    );
    expect(
      screen.getByText("External feedback average: — / 5"),
    ).toBeInTheDocument();
  });
});

describe("review draft workflow", () => {
  it("explains external-reviewer, confidentiality and inactive-account blockers", () => {
    const members = [
      { user_id: "subject", name: "Subject" },
      { user_id: "peer", name: "Peer" },
    ];
    const self = {
      id: "self",
      reviewer_id: "subject",
      name: "Subject",
      relationship: "self" as const,
    };
    expect(cycleReadiness([self], members, cycle.deadline)).toEqual([
      "external",
    ]);
    expect(
      cycleReadiness(
        [
          self,
          { id: "p", reviewer_id: "peer", name: "Peer", relationship: "peers" },
        ],
        members,
        cycle.deadline,
      ),
    ).toEqual(["peers"]);
    expect(
      cycleReadiness(
        [
          self,
          {
            id: "m",
            reviewer_id: "departed",
            name: "Former manager",
            relationship: "manager",
          },
        ],
        members,
        "2000-01-01",
      ),
    ).toEqual(["inactive", "deadline"]);
    expect(
      cycleReadiness(
        [
          self,
          {
            id: "m",
            reviewer_id: "peer",
            name: "Manager",
            relationship: "manager",
          },
        ],
        members,
        cycle.deadline,
      ),
    ).toEqual([]);
  });
  it("edits an existing draft using its version and preserves the review subject", async () => {
    const draft = { ...cycle, status: "draft" as const, version: 7 };
    const data = {
      ...fixture,
      can_manage: true,
      cycles: [draft],
      tasks: [],
      members: [{ user_id: "subject", name: "Subject" }],
    };
    mount(data);
    await screen.findByRole("button", { name: /Quarter review/ });
    rpc.mockImplementation((_name, args) =>
      Promise.resolve({
        data:
          args._action === "roster"
            ? [
                {
                  id: "self",
                  reviewer_id: "subject",
                  name: "Subject",
                  relationship: "self",
                },
              ]
            : args._action === "edit"
              ? { id: cycle.id }
              : data,
        error: null,
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: /Quarter review/ }));
    expect(
      await screen.findByText(
        "Add at least one reviewer other than the subject.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Open cycle for participants" }),
    ).toBeDisabled();
    fireEvent.click(
      screen.getByRole("button", { name: "Edit draft criteria and period" }),
    );
    expect(screen.getByLabelText("Review subject")).toBeDisabled();
    expect(screen.getByLabelText("Cycle title")).toHaveValue("Quarter review");
    fireEvent.change(screen.getByLabelText("Cycle title"), {
      target: { value: "Revised quarter review" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));
    await waitFor(() =>
      expect(rpc).toHaveBeenCalledWith(
        "performance360",
        expect.objectContaining({
          _action: "edit",
          _payload: expect.objectContaining({
            cycle_id: cycle.id,
            version: 7,
            subject_id: "subject",
            title: "Revised quarter review",
          }),
        }),
      ),
    );
  });
});
