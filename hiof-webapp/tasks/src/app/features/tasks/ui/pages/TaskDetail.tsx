"use client";

import { useEffect, useState } from "react";
import { TaskSchema } from "../../tasksSchema";
import type { Task } from "@/db/schema";

// TODO: Håndterer ingen feil, loading state, 404 eller error
export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [data, setData] = useState<Task | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`/api/v1/tasks/${id}`);
      const result = (await response.json()) as {
        success: boolean;
        data: unknown;
      };
      if (!result.success) {
        setData(null);
        return;
      }
      const task = await TaskSchema.safeParseAsync(result.data);
      setData(task.success ? task.data : null);
    };
    fetchData();
  }, [params.id]);

  const updateName = async (newName: string) => {
    setIsMutating(true);
    setData((prev) => (prev ? { ...prev, name: newName } : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const name = formData.get("name");

    const response = await fetch(`/api/v1/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });
    const result = (await response.json()) as {
      success: boolean;
      data: unknown;
    };
    if (!result.success) {
      return;
    }
    const task = await TaskSchema.safeParseAsync(result.data);
    if (task.success) {
      setData(task.data);
    }
  };

  if (!data) {
    return <div>Loading...</div>;
  }
  return (
    <div className="p-4 container mx-auto">
      <p>Task Detail Page</p>
      <pre className="bg-gray-100 p-4 rounded my-4">
        {isMutating ? "(draft)" : ""}
        {JSON.stringify(data, null, 2)}
      </pre>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={data.name}
          onChange={(e) => updateName(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        />
        <button
          type="submit"
          className="ml-2 bg-blue-500 text-white px-4 py-1 rounded"
        >
          Oppdater navn
        </button>
      </form>
    </div>
  );
}
