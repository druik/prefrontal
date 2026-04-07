"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// --- Types ---

interface DemoTask {
  id: string;
  title: string;
  created_at: string;
}

type CapacityState = "low" | "moderate" | "high" | "rest";

const CAPACITY_OPTIONS: CapacityState[] = ["low", "moderate", "high", "rest"];

const TASKS_BY_CAPACITY: Record<CapacityState, string[]> = {
  rest: [],
  low: ["Order new badge holder"],
  moderate: ["Order new badge holder", "Text Snober re: onboarding call"],
  high: [
    "Order new badge holder",
    "Text Snober re: onboarding call",
    "Schedule Labcorp appointment",
  ],
};

// --- Helpers ---

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatCountdown(target: Date, now: Date): string {
  const diff = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
  if (diff === 0) return "now";
  const m = Math.floor(diff / 60);
  const s = diff % 60;
  if (m === 0) return `in ${s}s`;
  return s > 0 ? `in ${m}m ${s}s` : `in ${m}m`;
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

// --- Component ---

export default function DemoPage() {
  const [now, setNow] = useState<Date>(new Date());
  const [capacity, setCapacity] = useState<CapacityState>("moderate");
  const standupTime = useRef(new Date(Date.now() + 45 * 60 * 1000));

  const [tasks, setTasks] = useState<DemoTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchTasks = useCallback(async () => {
    const res = await fetch("/api/demo/tasks");
    const data = await res.json();
    setTasks(data.tasks ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, [fetchTasks]);

  const fakeTasks = TASKS_BY_CAPACITY[capacity];

  return (
    <div className="flex flex-col items-center">
      {/* Section 1: Cortex Display */}
      <section
        className="w-full px-6 py-16 flex flex-col items-center"
        style={{ backgroundColor: "#000000" }}
      >
        <div className="w-full max-w-[640px]">
          <p
            className="tracking-tight leading-none mb-1"
            style={{ fontSize: "8vw", fontWeight: 300, color: "#ffffff" }}
          >
            {formatTime(now)}
          </p>
          <p className="mb-10" style={{ fontSize: "2.5vw", color: "#6b7280" }}>
            {formatDate(now)}
          </p>

          {/* Calendar event */}
          <div
            className="pl-5 mb-10"
            style={{ borderLeft: "2px solid rgba(59,130,246,0.4)" }}
          >
            <p style={{ fontSize: "1.8vw", color: "rgba(59,130,246,0.8)" }}>
              {formatTime(standupTime.current)}
              <span style={{ color: "rgba(255,255,255,0.5)", margin: "0 8px" }}>·</span>
              Team Standup
            </p>
            <p
              className="mt-1 font-medium"
              style={{ fontSize: "1.8vw", color: "rgba(59,130,246,0.5)" }}
            >
              {formatCountdown(standupTime.current, now)}
            </p>
          </div>

          {/* Capacity selector */}
          <div className="flex gap-4 mb-10">
            {CAPACITY_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setCapacity(opt)}
                className="capitalize border-0 bg-transparent p-0 cursor-pointer border-b-2"
                style={{
                  fontSize: "14px",
                  color: capacity === opt ? "#ffffff" : "#6b7280",
                  borderBottomColor: capacity === opt ? "rgba(255,255,255,0.4)" : "transparent",
                }}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Tasks */}
          {fakeTasks.length > 0 ? (
            <div className="flex flex-col gap-4">
              {fakeTasks.map((title) => (
                <p
                  key={title}
                  style={{ fontSize: "1.5vw", color: "rgba(255,255,255,0.7)", margin: 0 }}
                >
                  {title}
                </p>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: "1.5vw", color: "#6b7280", margin: 0 }}>Rest</p>
          )}
        </div>
      </section>

      {/* Divider */}
      <div className="w-full h-px bg-white/[0.06]" />

      {/* Section 2: Bridge */}
      <section className="w-full bg-[#111111] px-6 py-16 flex flex-col items-center">
        <div className="w-full max-w-[640px] flex flex-col items-center">
          <img
            src="/demo-prefrontal.png"
            alt="Prefrontal planning interface"
            className="w-full max-w-[520px] rounded-lg mb-8"
          />
          <p className="text-sm text-[#9ca3af] text-center max-w-[520px] leading-relaxed">
            Prefrontal is where you decide what&#39;s worth your attention
            today. Tasks move from backlog to display with one tap.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="w-full h-px bg-white/[0.06]" />

      {/* Section 3: Live capture feed */}
      <section className="w-full bg-[#111111] px-6 py-16 flex flex-col items-center">
        <div className="w-full max-w-[640px]">
          <h2 className="text-xl font-light text-[#f5f5f5] mb-2">
            Try it yourself
          </h2>
          <p className="text-sm text-[#9ca3af] mb-1">
            <a
              href="https://www.icloud.com/shortcuts/d381a06f254348e69d6cdfa19a8fce45"
              className="text-[#60a5fa] hover:text-blue-300"
            >
              Add the Quick Capture shortcut
            </a>
            . Type anything. Watch it appear here.
          </p>
          <p className="text-[11px] text-[#9ca3af]/50 mb-8">
            Limited to 5 captures per minute to keep things running smoothly.
          </p>

          {loading ? (
            <p className="text-[#9ca3af] text-sm">Loading…</p>
          ) : tasks.length === 0 ? (
            <p className="text-[#9ca3af] text-sm">
              No captures yet. Be the first.
            </p>
          ) : (
            <ul>
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between min-h-[44px] gap-4 px-1"
                >
                  <span className="text-[18px] text-[#f5f5f5] leading-snug">
                    {task.title}
                  </span>
                  <span className="text-[11px] text-[#9ca3af]/50 shrink-0">
                    {timeAgo(task.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* Privacy notice */}
          <div className="rounded-lg bg-[#1a1a1a] px-4 py-3 mt-10">
            <p className="text-xs text-[#9ca3af] leading-relaxed">
              This is a shared demo. Don&#39;t type anything you wouldn&#39;t
              put on a sticky note on your front door. Captures are
              automatically deleted after 24 hours.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
