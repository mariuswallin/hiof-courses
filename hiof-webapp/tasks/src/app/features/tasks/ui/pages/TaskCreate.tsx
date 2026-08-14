import { requestInfo } from "rwsdk/worker";
import { TaskForm } from "../forms/TaskForm";

export default async function TaskCreatePage() {
  const { user } = requestInfo.ctx;
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Opprett ny oppgave</h1>
      <TaskForm userId={user?.id ?? 1} />
    </div>
  );
}
