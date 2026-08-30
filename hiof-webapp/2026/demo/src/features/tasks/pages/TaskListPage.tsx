import { requestInfo, type RequestInfo } from "rwsdk/worker";
import { tasksService } from "../tasksService";

export default async function TaskListPage(props: RequestInfo) {
  const { ctx } = requestInfo;
  // TODO: Could validate permissions here using ctx.user
  const { request } = props;
  const searchParams = new URL(request.url).searchParams;
  const { published } = Object.fromEntries(searchParams.entries());

  const tasks = await tasksService.list({ published });
  return (
    <pre className="mx-2 my-5 p-6 border border-slate-200 fit-content rounded-md bg-slate-50 text-sm text-slate-800">
      {JSON.stringify(tasks, null, 2)}
    </pre>
  );
}
