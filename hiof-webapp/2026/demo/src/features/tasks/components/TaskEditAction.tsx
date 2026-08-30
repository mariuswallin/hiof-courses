"use client";

import type { Task } from "@/db/schema";
import { useActionState } from "react";
import {
  editTaskAction,
  type EditTaskState,
} from "../actions/editTaskAction";
import { useAuth } from "@/hooks/useAuth";

// "use client" at the top makes this a client component, which is what lets
// it use hooks. `task` is passed as a prop from the server component in
// ../pages/TaskEdit.tsx.
export default function TaskEditAction({ task }: { task: Task }) {
  const user = useAuth();

  const initialState: EditTaskState = {
    success: true,
    data: { id: task.id, name: task.name },
  };

  // useActionState wires a server action to a form and returns three things:
  //   state       what the action last returned, starting at initialState
  //   formAction  passed to <form action=...>, runs the action on submit
  //   isPending   true while the action is in flight
  const [state, formAction, isPending] = useActionState(
    editTaskAction,
    initialState
  );

  // On failure what the user typed is in `state.state`, otherwise in `state.data`.
  const fields = state.success ? state.data : state.state;

  if (isPending) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-gray-200 h-32 rounded"></div>
        <div className="animate-pulse bg-gray-200 h-48 rounded"></div>
        <div className="animate-pulse bg-gray-200 h-12 rounded"></div>
      </div>
    );
  }

  return (
    <section>
      <h2>Edit {JSON.stringify(state)}</h2>
      {!state.success && <p role="alert">{state.error.message}</p>}
      <form action={formAction} className="space-y-4">
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          required
          minLength={3}
          maxLength={200}
          defaultValue={fields?.name ?? ""}
          placeholder="F.eks. Ferdigstill prosjektdokumentasjon"
          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500  border-gray-300`}
        />
        <input type="hidden" name="id" value={task.id} />
        <button type="submit">Save</button>
      </form>
      <p>User: {JSON.stringify(user)}</p>
    </section>
  );
}
