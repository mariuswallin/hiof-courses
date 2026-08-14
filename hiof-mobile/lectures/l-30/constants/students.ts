// constants/students.ts

import type { Student } from "../types";

export const Students: Student[] = [
  {
    id: 123456,
    name: "Lars Larsen",
    program: "informatikk",
    image: null,
    expireAt: "2025-12-31",
    userId: "123456",
    isActive: true,
  },
  {
    id: 654321,
    name: "Sara Hansen",
    program: "informatikk",
    image: null,
    expireAt: "2025-12-31",
    userId: "654321",
    isActive: false,
  },
  {
    id: 789012,
    name: "Ali Khan",
    program: "informatikk",
    image: null,
    expireAt: "2025-12-31",
    userId: "789012",
    isActive: true,
  },
];

// Mock data — generates 50 students
const tempStudents: Student[] = Array.from({ length: 50 }, (_, index) => {
  const id = 1000000 + index;
  const programs = [
    "Informatikk",
    "Dataingeniør",
    "Kybernetikk",
    "Digital markedsføring",
    "Kunstig intelligens",
  ];
  const program = programs[Math.floor(Math.random() * programs.length)];

  return {
    id,
    name: `Student ${id}`,
    program,
    image: null,
    expireAt: new Date(Date.now() + 31536000000).toISOString(), // Ett år frem i tid
    userId: `user_${Math.floor(1000 + Math.random() * 9000)}`,
    isActive: Math.random() > 0.1, // 90% sjanse for at studenten er aktiv
  };
});

/**
 * Mock function for cursor pagination
 *
 * @param pageParam Pagination cursor (the ID of the last student)
 * @returns Response with students and the next cursor
 */
export const getStudentsWithCursorMock = async (
  pageParam: string | null,
): Promise<{
  success: boolean;
  data: { students: Student[]; nextCursor: string | null };
  error?: string;
}> => {
  // Simulate network latency (500ms)
  await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    // Find the start index from the cursor
    let startIndex = 0;
    if (pageParam !== null) {
      const cursorIndex = tempStudents.findIndex(
        (student) => student.id === Number(pageParam),
      );
      startIndex = cursorIndex === -1 ? 0 : cursorIndex + 1;
    }

    // Fetch the next set of students (10 per page)
    const limit = 10;
    const endIndex = Math.min(startIndex + limit, tempStudents.length);
    const students = tempStudents.slice(startIndex, endIndex);

    // Work out the next cursor
    const hasMoreData = endIndex < tempStudents.length;
    const nextCursor = hasMoreData ? String(students.at(-1)!.id) : null;

    return {
      success: true,
      data: {
        students,
        nextCursor,
      },
    };
  } catch (error) {
    return {
      success: false,
      data: { students: [], nextCursor: null },
      error: error instanceof Error ? error.message : "Ukjent feil",
    };
  }
};
