"use client";

import { createContext, useEffect, useState } from "react";
import type { Task } from "../types";

interface TaskContext {
  tasks: Task[];
  addTask: (task: Task) => void;
  removeTask: (task: Task) => void;
  fetchTasks: () => Promise<Task[]>;
  toggleTaskCompletion: (taskId: string) => void;
}

export const TaskContext = createContext<TaskContext | undefined>(undefined);

export function TaskProvider({
  children,
  initialTasks,
}: {
  children: React.ReactNode;
  initialTasks: Task[];
}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = () => {
    return fetch("/api/tasks-simple")
      .then((res) => res.json())
      .then((data) => {
        const transformedData = data.map((task) => ({
          ...task,
          dueDate: new Date(task.dueDate),
        }));
        console.log("Fetched tasks:", transformedData);
        setTasks(transformedData);
        return transformedData;
      });
  };

  const addTask = (task: Task) => {
    setTasks((prevTasks) => [...prevTasks, task]);
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const removeTask = (task: Task) => {
    setTasks((prevTasks) => prevTasks.filter((t) => t.id !== task.id));
  };

  return (
    <TaskContext
      value={{ tasks, addTask, removeTask, fetchTasks, toggleTaskCompletion }}
    >
      {children}
    </TaskContext>
  );
}
