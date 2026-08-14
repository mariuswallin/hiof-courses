import type { Task } from '../types';

export default function TaskItem({
  task,
  onAction,
}: {
  task: Task;
  onAction: (task: Task, time: number) => void;
}) {
  // The function to trigger
  const onTaskClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('Clicked', e);
    onAction(task, new Date().getMilliseconds());
  };

  return (
    <section>
      <h2>Task item</h2>
      {/* Button here */}
      <button onClick={onTaskClick}>Task logger button</button>
    </section>
  );
}
