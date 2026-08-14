// Q: Hva skjer når vi tar bort denne?
"use client";

import StudentList from "@/components/StudentList";
import { studentWithGrades } from "@/data";

export function Home() {
  const actions = {
    edit: (id: string) => {
      console.log("Edit student with id:", id);
    },
    remove: (id: string) => {
      console.log("Remove student with id:", id);
    },
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-slate-800 text-white">
      <h1 className="text-4xl font-bold">Student Dashboard</h1>
      <StudentList data={studentWithGrades} actions={actions} />
    </main>
  );
}
