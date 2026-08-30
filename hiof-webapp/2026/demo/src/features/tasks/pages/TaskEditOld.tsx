"use client";

import { useEffect, useState } from "react";
import type { Task } from "@/db/schema";

// The older pattern: the client fetches its own data and posts it back by
// hand. Compare with ../components/TaskEditAction.tsx, which uses a server
// action instead.
//
// `params` comes from the route (/tasks/old/:taskId/edit) and is passed in as
// a prop by src/worker.tsx.
export default function TaskEditOld({
  params,
}: {
  params: { taskId: string };
}) {
  const [task, setTask] = useState<Task | undefined>(undefined);

  const { taskId } = params;

  // Fetch on mount. The [taskId] dependency array keeps it from re-running
  // on every render.
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // Without preventDefault the browser would do a full page reload.
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;

    try {
      const response = await fetch(`/api/v1/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });
      const updatedTask = (await response.json()) as { data: Task };
      console.log("Updated task:", updatedTask);
      setTask(updatedTask.data);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  return (
    <section>
      <h2>Edit {JSON.stringify(task)}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          required
          minLength={3}
          maxLength={200}
          value={task?.name ?? ""}
          onChange={(e) =>
            setTask((prev) => (prev ? { ...prev, name: e.target.value } : prev))
          }
          placeholder="Placeholder text"
          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500  border-gray-300`}
        />
        {/* handleSubmit reads the id out of FormData, so it has to be in
            the form. Without this field `formData.get("id")` is null and the
            PUT goes to /api/v1/tasks/null. */}
        <input type="hidden" name="id" value={task?.id ?? ""} />
        <button type="submit">Save</button>
      </form>
    </section>
  );
}
