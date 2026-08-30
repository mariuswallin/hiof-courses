"use client";

import { useState, useTransition } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { move } from "@dnd-kit/helpers";
import type { Task } from "@/db/schema";
import { reorderTasksAction } from "../actions/reorderTasksAction";

/**
 * Drag and drop reordering with dnd-kit.
 *
 * The list is client state so the new order shows up the instant you drop.
 * The server action then persists it, and the state is rolled back if the
 * write fails.
 *
 * `tasks` is passed as a prop from the server component in
 * ../pages/TaskSortable.tsx, already sorted by `order`.
 */
export default function TaskSortableList({ tasks }: { tasks: Task[] }) {
  const [items, setItems] = useState(tasks);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();

  return (
    <section>
      <h2 className="text-xl font-bold">Sortable tasks</h2>
      <p className="text-sm text-gray-600">
        Drag a row, or focus a handle and press Space, then use the arrow keys.
      </p>

      {error && (
        <p role="alert" className="text-red-600">
          {error}
        </p>
      )}

      {/*
        DragDropProvider wires up the sensors and fires onDragEnd when a drag
        finishes. The pointer and keyboard sensors are both on by default.
      */}
      <DragDropProvider
        onDragEnd={(event) => {
          const previous = items;
          // move() reads the source and target off the event and returns the
          // array in its new order. It returns the same array when the drop
          // changed nothing, so compare before saving.
          const next = move(items, event);
          if (next === previous) return;

          setItems(next);
          setError(null);

          startSaving(async () => {
            const result = await reorderTasksAction(next.map((task) => task.id));
            if (!result.success) {
              // Roll back to the order the server still has.
              setItems(previous);
              setError(result.error.message);
            }
          });
        }}
      >
        <ol
          aria-label="Tasks"
          aria-busy={isSaving}
          className="mt-4 flex flex-col gap-2"
        >
          {items.map((task, index) => (
            <SortableTaskRow key={task.id} task={task} index={index} />
          ))}
        </ol>
      </DragDropProvider>
    </section>
  );
}

/**
 * One row.
 *
 * useSortable registers the element with the provider. `index` is what tells
 * dnd-kit where this row sits, `ref` goes on the element that moves, and
 * `handleRef` on the element you grab. Putting the handle on a button rather
 * than the whole row keeps the row text selectable and gives keyboard users a
 * real tab stop.
 */
function SortableTaskRow({ task, index }: { task: Task; index: number }) {
  const { ref, handleRef, isDragging } = useSortable({ id: task.id, index });

  return (
    <li
      ref={ref}
      data-testid="task-row"
      data-task-id={task.id}
      className={`flex items-center gap-3 rounded-md border border-gray-300 bg-white p-3 ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <button
        ref={handleRef}
        type="button"
        aria-label={`Reorder ${task.name}`}
        className="cursor-grab px-2 text-gray-500"
      >
        ⠿
      </button>
      <span className="font-medium">{task.name}</span>
      <span className="text-sm text-gray-600">{task.description}</span>
    </li>
  );
}
