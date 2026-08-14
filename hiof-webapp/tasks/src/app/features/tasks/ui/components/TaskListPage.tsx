"use client";

import { use } from "react";
import { TaskList } from "./TaskList";
import type { TaskDTO } from "../../tasksService";
import type { Result } from "@/app/types/result";

export default function TaskListPage({
  promise,
}: {
  promise: Promise<Result<TaskDTO[]>>;
}) {
  const tasks = use(promise);

  if (!tasks.success) {
    const error = tasks.error || {
      message: "Unknown error",
      code: 500,
    };
    return (
      <>
        <h1>Task List</h1>
        <div className="error">
          <p className="text">
            Error: {error.message} (Code: {error.code})
          </p>
        </div>
      </>
    );
  }

  return <TaskList tasks={tasks.data} />;
}
