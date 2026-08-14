import { tasks } from "@/worker";
import { TaskProvider } from "./TaskContext";

export default function TaskContextLayoutDemo({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TaskProvider initialTasks={tasks}>{children}</TaskProvider>;
}
