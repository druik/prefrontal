"use client";

import { useCallback, useEffect, useState } from "react";

interface DemoTask {
  id: string;
  title: string;
  created_at: string;
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

export default function DemoPage() {
  const [tasks, setTasks] = useState<DemoTask[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="flex-1 flex flex-col items-center px-4">
      <div className="w-full max-w-[640px] pt-12 pb-8">
        <h1 className="text-2xl font-light text-foreground mb-2">
          Prefrontal
        </h1>
        <p className="text-sm text-muted mb-8">Live demo</p>

        <div className="rounded-md bg-white/5 px-4 py-3 mb-2 text-xs text-muted leading-relaxed">
          This is a shared demo. Don&#39;t type anything you wouldn&#39;t put
          on a sticky note on your front door. Captures are automatically
          deleted after 24 hours.
        </div>
        <p className="text-xs text-muted/60 mb-8">
          Limited to 5 captures per minute to keep things running smoothly.
        </p>

        {loading ? (
          <p className="text-muted text-sm">Loading…</p>
        ) : tasks.length === 0 ? (
          <p className="text-muted text-sm">
            No demo tasks yet. Use the iOS Shortcut to capture one.
          </p>
        ) : (
          <ul>
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between min-h-[44px] gap-3"
              >
                <span className="text-[18px] text-foreground leading-snug">
                  {task.title}
                </span>
                <span className="text-xs text-muted shrink-0">
                  {timeAgo(task.created_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
