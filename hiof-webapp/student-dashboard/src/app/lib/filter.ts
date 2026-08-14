import type { Student, StudentFilter } from "@/types";

export const filterStudents = (
  students: Student[],
  filter: StudentFilter
): Student[] => {
  return students.filter((student) => {
    // return filter.status && student.status !== filter.status;
    if (filter.status && student.status !== filter.status) {
      return false;
    }
    return true;
  });
};
