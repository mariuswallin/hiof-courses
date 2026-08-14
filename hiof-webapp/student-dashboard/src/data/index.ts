import type { Grades, Student, StudentWithGrade } from "@/types";

export const students: Student[] = [
  {
    id: "1",
    name: "Alice",
    status: "active",
  },
  {
    id: "2",
    name: "Bob",
    status: "inactive",
  },
  {
    id: "3",
    name: "Charlie",
    status: "active",
  },
];

export const grades: Grades[] = [
  {
    studentId: "1",
    subject: "Math",
    grade: "A",
  },
  {
    studentId: "2",
    subject: "English",
    grade: "B",
  },
  {
    studentId: "3",
    subject: "Science",
    grade: "A",
  },
  {
    studentId: "1",
    subject: "Science",
    grade: "B",
  },
];

export const studentWithGrades: StudentWithGrade[] = students.map(
  (student) => ({
    ...student,
    grades: grades.filter((grade) => grade.studentId === student.id),
  })
);
