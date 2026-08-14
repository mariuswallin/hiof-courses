import type React from 'react';
import type { Task } from '../types';
import TaskCard from './TaskCard';

export default function TaskList({ tasks, children }: { tasks: Task[], children: React.ReactNode }) {
  return (
    <section>
      <p>TaskList {tasks.length}</p>
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
      {children}
    </section>
  );
}

// <TaskList tasks={} />
