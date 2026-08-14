import { Suspense } from "react";

import type { RequestInfo } from "rwsdk/worker";
import { taskService } from "../../tasksService";
import TaskListPageData from "../components/TaskListPage";

const TaskLoadingSkeleton = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-10 bg-gray-200 animate-pulse rounded"></div>
    ))}
  </div>
);

export default async function TaskListPage(props: RequestInfo) {
  const searchParams = new URLSearchParams(props.request.url);
  const taskListPromise = taskService.list(Object.fromEntries(searchParams));

  return (
    <div className="container mx-auto">
      <h1>Task List</h1>
      <Suspense fallback={<TaskLoadingSkeleton />}>
        <TaskListPageData promise={taskListPromise} />
      </Suspense>
    </div>
  );
}
