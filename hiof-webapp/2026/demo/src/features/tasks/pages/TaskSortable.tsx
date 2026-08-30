import { tasksService } from "../tasksService";
import TaskSortableList from "../components/TaskSortableList";

// Server component. It reads the tasks already sorted by `order` and hands
// them to the client component, which owns the dragging.
export default async function TaskSortable() {
  const tasks = await tasksService.listOrdered();

  if (!tasks.success) {
    return <div>Could not load tasks: {tasks.error.message}</div>;
  }

  return <TaskSortableList tasks={tasks.data} />;
}
