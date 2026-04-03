"use client";

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState } from "react";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

const supabase: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Task = {
  id: string;
  title: string;
  completed: boolean;
  approved_date: string | null;
  created_at: string;
};

type Tab = "today" | "backlog";
type CapacityState = "low" | "moderate" | "high" | "rest";
const CAPACITY_OPTIONS: CapacityState[] = ["low", "moderate", "high", "rest"];

const DEMO_TODAY: Task[] = [
  { id: "d1", title: "Prep for 2pm department standup", completed: false, approved_date: "2024-01-01", created_at: "" },
  { id: "d2", title: "Pick up Zoe from soccer at 5:30", completed: false, approved_date: "2024-01-01", created_at: "" },
  { id: "d3", title: "Review vendor contract before Thursday", completed: false, approved_date: "2024-01-01", created_at: "" },
];
const DEMO_COMPLETED: Task[] = [
  { id: "d4", title: "School permission slip signed and sent", completed: true, approved_date: "2024-01-01", created_at: "" },
];
const DEMO_BACKLOG: Task[] = [
  { id: "d5", title: "Schedule pediatrician annual visit for Zoe", completed: false, approved_date: null, created_at: "" },
  { id: "d6", title: "Submit expense report (deadline Friday)", completed: false, approved_date: null, created_at: "" },
  { id: "d7", title: "Reply to Maya re: carpool schedule", completed: false, approved_date: null, created_at: "" },
  { id: "d8", title: "Research meal prep for next week", completed: false, approved_date: null, created_at: "" },
  { id: "d9", title: "Follow up with IT about VPN access", completed: false, approved_date: null, created_at: "" },
  { id: "d10", title: "Book oil change", completed: false, approved_date: null, created_at: "" },
  { id: "d11", title: "Read new EHR policy update", completed: false, approved_date: null, created_at: "" },
  { id: "d12", title: "Call mom back", completed: false, approved_date: null, created_at: "" },
  { id: "d13", title: "Order birthday gift for dad (ships in 5 days)", completed: false, approved_date: null, created_at: "" },
  { id: "d14", title: "Draft agenda for Monday team meeting", completed: false, approved_date: null, created_at: "" },
];

function todayDate(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Los_Angeles",
  });
}

function tomorrowDate(): string {
  const d = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  );
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function MoreMenu({
  actions,
}: {
  actions: { label: string; onClick: () => void }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-[44px] h-[44px] flex items-center justify-center text-muted hover:text-foreground"
        style={{ transition: "color 150ms" }}
        aria-label="More options"
      >
        ···
      </button>
      {open && (
        <div className="absolute right-0 top-full z-10 min-w-[140px] rounded-md bg-surface border border-white/10 py-1 shadow-lg">
          {actions.map((a) => (
            <button
              key={a.label}
              onClick={() => {
                a.onClick();
                setOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-white/5"
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("today");
  const [userId, setUserId] = useState<string | null>(null);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [backlogTasks, setBacklogTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);
  const [capacity, setCapacity] = useState<CapacityState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (DEMO_MODE) {
      setUserId("demo");
      setTodayTasks(DEMO_TODAY);
      setCompletedTasks(DEMO_COMPLETED);
      setBacklogTasks(DEMO_BACKLOG);
      setCapacity("moderate");
      setLoading(false);
      return;
    }
    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        const { data } = await supabase.auth.signInAnonymously();
        if (data.user) setUserId(data.user.id);
      }
    }
    init();
  }, []);

  const fetchTasks = useCallback(async () => {
    if (!userId || DEMO_MODE) return;
    setLoading(true);
    const today = todayDate();

    const [todayRes, completedRes, backlogRes, capacityRes] = await Promise.all([
      supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .eq("approved_date", today)
        .eq("completed", false)
        .order("created_at", { ascending: true }),
      supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .eq("approved_date", today)
        .eq("completed", true)
        .order("created_at", { ascending: true }),
      supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .is("approved_date", null)
        .eq("completed", false)
        .order("created_at", { ascending: true }),
      supabase
        .from("Capacity")
        .select("state")
        .eq("id", 1)
        .single(),
    ]);

    console.log("[Capacity] fetch response:", capacityRes);
    if (capacityRes.data) {
      setCapacity(capacityRes.data.state as CapacityState);
    }
    setTodayTasks(todayRes.data ?? []);
    setCompletedTasks(completedRes.data ?? []);
    setBacklogTasks(backlogRes.data ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const noop = DEMO_MODE;

  async function toggleComplete(task: Task) {
    if (noop) return;
    await supabase
      .from("tasks")
      .update({ completed: !task.completed })
      .eq("id", task.id);
    fetchTasks();
  }

  async function removeFromToday(taskId: string) {
    if (noop) return;
    await supabase
      .from("tasks")
      .update({ approved_date: null, approved_at: null })
      .eq("id", taskId);
    fetchTasks();
  }

  async function deleteTask(taskId: string) {
    if (noop) return;
    await supabase.from("tasks").delete().eq("id", taskId);
    fetchTasks();
  }

  async function planForTomorrow(taskId: string) {
    if (noop) return;
    setTodayTasks((prev) => prev.filter((t) => t.id !== taskId));
    await supabase
      .from("tasks")
      .update({ approved_date: tomorrowDate() })
      .eq("id", taskId);
    fetchTasks();
  }

  async function addToToday(taskId: string) {
    if (noop) return;
    await supabase
      .from("tasks")
      .update({ approved_date: todayDate(), approved_at: new Date().toISOString() })
      .eq("id", taskId);
    fetchTasks();
  }

  async function addTask() {
    if (noop) return;
    const title = newTitle.trim();
    if (!title || !userId) return;
    setNewTitle("");
    await supabase.from("tasks").insert({
      title,
      completed: false,
      approved_date: null,
      user_id: userId,
    });
    fetchTasks();
  }

  async function updateCapacity(state: CapacityState) {
    console.log("[Capacity] setting:", state);
    setCapacity(state);
    if (noop) return;
    const res = await supabase
      .from("Capacity")
      .update({ state, updated_at: new Date().toISOString() })
      .eq("id", 1);
    console.log("[Capacity] update response:", res);
  }

  if (!userId) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center px-4">
      {DEMO_MODE && (
        <div className="w-full max-w-[640px] mt-4 px-3 py-2 rounded-md bg-white/5 text-muted text-xs text-center">
          You&#39;re viewing a demo. Sign in to use your own workspace.
        </div>
      )}
      <div className="w-full max-w-[640px] pt-12 pb-8">
        <h1 className="text-2xl font-light text-foreground mb-6">
          Prefrontal
        </h1>

        <div className="flex gap-4 mb-6">
          {CAPACITY_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => updateCapacity(opt)}
              className={`text-sm capitalize min-h-[44px] px-1 border-b-2 ${
                capacity === opt
                  ? "text-foreground border-b-white/40"
                  : "text-muted border-b-transparent"
              }`}
              style={{ transition: "color 150ms" }}
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="flex gap-6 border-b border-white/10 mb-6">
          <button
            onClick={() => setTab("today")}
            className={`pb-3 text-sm font-medium ${
              tab === "today"
                ? "text-accent border-b-2 border-accent"
                : "text-muted"
            }`}
          >
            Plan Today
          </button>
          <button
            onClick={() => setTab("backlog")}
            className={`pb-3 text-sm font-medium ${
              tab === "backlog"
                ? "text-accent border-b-2 border-accent"
                : "text-muted"
            }`}
          >
            Backlog{backlogTasks.length > 0 ? ` (${backlogTasks.length})` : ""}
          </button>
        </div>

        {loading ? (
          <p className="text-muted text-sm">Loading…</p>
        ) : tab === "today" ? (
          <div>
            {todayTasks.length === 0 && completedTasks.length === 0 && (
              <p className="text-muted text-sm">
                No tasks for today. Add some from the Backlog.
              </p>
            )}
            {todayTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center min-h-[44px] gap-3 group"
              >
                <input
                  type="checkbox"
                  checked={false}
                  onChange={() => toggleComplete(task)}
                  className="w-[18px] h-[18px] rounded border-white/20 bg-transparent accent-accent cursor-pointer shrink-0"
                />
                <span className="flex-1 text-[18px] text-foreground leading-snug">
                  {task.title}
                </span>
                <MoreMenu
                  actions={[
                    { label: "Remove", onClick: () => removeFromToday(task.id) },
                    { label: "Plan for tomorrow", onClick: () => planForTomorrow(task.id) },
                    { label: "Delete", onClick: () => deleteTask(task.id) },
                  ]}
                />
              </div>
            ))}

            {completedTasks.length > 0 && (
              <div className="mt-6">
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="text-sm text-muted hover:text-foreground flex items-center gap-2"
                  style={{ transition: "color 150ms" }}
                >
                  <span
                    className="inline-block"
                    style={{
                      transform: showCompleted
                        ? "rotate(90deg)"
                        : "rotate(0deg)",
                    }}
                  >
                    ▸
                  </span>
                  Completed Today ({completedTasks.length})
                </button>
                {showCompleted && (
                  <div className="mt-2">
                    {completedTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center min-h-[44px] gap-3"
                      >
                        <input
                          type="checkbox"
                          checked={true}
                          onChange={() => toggleComplete(task)}
                          className="w-[18px] h-[18px] rounded border-white/20 bg-transparent accent-accent cursor-pointer shrink-0"
                        />
                        <span className="flex-1 text-[18px] text-muted line-through leading-snug">
                          {task.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            {backlogTasks.length === 0 && (
              <p className="text-muted text-sm mb-4">
                No tasks in backlog. Add one below.
              </p>
            )}
            {backlogTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center min-h-[44px] gap-3"
              >
                <span className="flex-1 text-[18px] text-foreground leading-snug">
                  {task.title}
                </span>
                <button
                  onClick={() => addToToday(task.id)}
                  className="shrink-0 text-sm text-accent hover:text-blue-300 px-3 py-1"
                  style={{ transition: "color 150ms" }}
                >
                  Add to today
                </button>
                <MoreMenu
                  actions={[
                    { label: "Delete", onClick: () => deleteTask(task.id) },
                  ]}
                />
              </div>
            ))}

            <div className="flex gap-2 mt-6">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addTask();
                }}
                placeholder="Add a task…"
                className="flex-1 h-[44px] px-3 bg-surface border border-white/10 rounded-md text-foreground text-[16px] placeholder:text-muted outline-none focus:border-accent"
              />
              <button
                onClick={addTask}
                className="h-[44px] px-5 bg-accent text-black font-medium rounded-md hover:bg-blue-300 shrink-0"
                style={{ transition: "background-color 150ms" }}
              >
                Add
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
