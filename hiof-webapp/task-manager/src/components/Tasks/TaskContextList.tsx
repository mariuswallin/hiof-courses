"use client";

import { useTaskContext } from "./useTasks";
import { CheckCheck, X } from "lucide-react";

export default function TaskContextList() {
  const { tasks, addTask, toggleTaskCompletion } = useTaskContext();

  const onAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    console.log(form);
    const input = form.elements.namedItem("name") as HTMLInputElement;
    const taskName = input.value.trim();
    if (taskName) {
      addTask({
        name: taskName,
        id: crypto.randomUUID(),
        description: `Description for ${taskName}`,
        dueDate: new Date(),
      });
      input.value = "";
    }
  };

  return (
    <section className="task-list">
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <h3>{task.name}</h3>
            <p>{task.description}</p>
            <time dateTime={task.dueDate.toISOString()}>
              {task.dueDate.toISOString()}
            </time>
            <button
              onClick={() => toggleTaskCompletion(task.id)}
              className={task.completed ? "completed" : ""}
            >
              {task.completed ? <CheckCheck /> : <X />}
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={onAddTask}>
        <input type="text" name="name" placeholder="New task name" />
        <button type="submit">Add Task</button>
      </form>
    </section>
  );
}
