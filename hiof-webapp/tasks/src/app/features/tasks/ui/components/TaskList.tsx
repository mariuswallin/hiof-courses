"use client";

// src/app/features/tasks/components/components/TaskList.tsx

import { useActionState, useOptimistic, useTransition } from "react";
import { completeTaskAction } from "../../tasksActions";
import type { TaskDTO } from "../../tasksService";

export function TaskList({ tasks }: { tasks: TaskDTO[] }) {
  const [, startTransition] = useTransition();
  const [, action, isPending] = useActionState(
    (prev, taskId: string) => completeTaskAction(taskId),
    {
      success: true,
      data: null,
    }
  );
  const [optimisticCompleted, setOptimisticCompleted] = useOptimistic(
    tasks,
    (state, taskId: string) => {
      return state.map((task) =>
        task.id === taskId ? { ...task, completed: true } : task
      );
    }
  );

  const complete = async (taskId: string) => {
    startTransition(async () => {
      setOptimisticCompleted(taskId);
      await action(taskId);
    });
  };

  return (
    <section className="space-y-2">
      <h3 className="text-lg font-medium">Oppgaver ({tasks.length})</h3>

      {tasks.length === 0 ? (
        <p className="text-gray-500">Ingen oppgaver lagt til ennå.</p>
      ) : (
        <article className="space-y-2">
          {optimisticCompleted.map((task) => (
            <div key={task.id} className={`p-3 rounded border`}>
              <div className="flex justify-between items-start">
                <p className="text-gray-900">{task.name}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Fullføres innen{" "}
                {new Date(task.dueDate).toLocaleDateString("no-NO")}
              </p>

              {!task.completed && (
                <button
                  type="submit"
                  onClick={() => complete(task.id)}
                  className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  {isPending ? "Fullfører..." : "Fullfør oppgave"}
                </button>
              )}
              <a
                href={`/tasks/${task.id}`}
                className="text-sm text-blue-500 hover:underline mt-2 inline-block"
              >
                Se detaljer
              </a>
            </div>
          ))}
        </article>
      )}
    </section>
  );
}
