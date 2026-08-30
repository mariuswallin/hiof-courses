import type { RequestInfo } from "rwsdk/worker";
import { tasksService } from "../tasksService";
import TaskEditAction from "../components/TaskEditAction";

export default async function TaskEdit(props: RequestInfo) {
  const { params } = props;

  const task = await tasksService.getById(params.taskId);
  if (!task.success) {
    return <div>Task not found</div>;
  }
  return <TaskEditAction task={task.data} />;
}
