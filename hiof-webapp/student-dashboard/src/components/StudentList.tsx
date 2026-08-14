"use client";

import { filterStudents } from "@/app/lib/filter";
import type { StudentFilter, StudentWithGrade } from "@/types";
import { useState } from "react";

export default function StudentList(params: {
  data: StudentWithGrade[];
  actions: { edit: (id: string) => void; remove: (id: string) => void };
}) {
  const { data, actions } = params;

  const [filter, setFilter] = useState<StudentFilter | undefined>(undefined);

  // Q: Hva får vi tilbake her?
  const filteredData = filter ? filterStudents(data, filter) : data;

  return (
    <main className="student-dashboard">
      <h2>Student List</h2>
      <section className="student-filter-wrapper">
        <select
          className="student-filter"
          onChange={(e) => {
            const value = e.target.value;
            setFilter(value ? { status: value } : undefined);
          }}
        >
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </section>
      <table>
        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th>Grades</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((student) => (
            <tr key={student.id}>
              <td>{student.id}</td>
              <td>{student.name}</td>
              <td>{JSON.stringify(student.grades)}</td>
              <td>
                <button onClick={() => actions.edit(student.id)}>Edit</button>
                <button onClick={() => actions.remove(student.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filteredData.length === 0 && (
        <div className="no-results">Ingen data tilgjengelig</div>
      )}
    </main>
  );
}
