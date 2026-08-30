import type { RequestInfo } from "rwsdk/worker";
import { tasksService } from "../tasksService";

export default async function TaskDetailRSC(props: RequestInfo) {
  const { params } = props;

  const task = await tasksService.getById(params.taskId);
  return (
    <pre className="mx-2 my-5 p-6 border border-slate-200 fit-content rounded-md bg-slate-50 text-sm text-slate-800">
      {JSON.stringify(task, null, 2)}
    </pre>
  );
}
