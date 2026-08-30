"use client";

import { useEffect, useState } from "react";
import type { Task } from "../../../db/schema";
import { useAuth } from "@/hooks/useAuth";

// The older pattern: a client component that fetches its own data. The RSC
// version in ./TaskDetailRSC.tsx reads the database directly on the server.
//
// `params` comes from the route (/tasks/old/:taskId) via src/worker.tsx.
export default function TaskDetailOld({
  params,
}: {
  params: { taskId: string };
}) {
  const user = useAuth();
  const { taskId } = params;
  const [task, setTask] = useState<Task | null>(null);

  // useEffect runs after render, which is where side effects like fetching
  // belong. The [taskId] dependency array means it re-runs only when the id
  // changes, not on every render.
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await fetch(`/api/v1/tasks/${taskId}`);
        const fetchedTask = (await response.json()) as { data: Task };
        setTask(fetchedTask.data);
      } catch (error) {
        console.error("Error fetching task:", error);
      }
    };
    fetchTask();
  }, [taskId]);

  return (
    <div>
      <pre className="mx-2 my-5 p-6 border border-slate-200 fit-content rounded-md bg-slate-50 text-sm text-slate-800">
        {JSON.stringify(task, null, 2)}
      </pre>
      <p>{user?.name}</p>
    </div>
  );
}
