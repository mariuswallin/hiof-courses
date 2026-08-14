export const STUDENT_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
};

export type StudentStatus =
  (typeof STUDENT_STATUS)[keyof typeof STUDENT_STATUS];

export interface Student {
  id: string;
  name: string;
  status: StudentStatus;
}

export interface Grades {
  studentId: string;
  subject: string;
  grade: string;
}

export interface StudentWithGrade extends Student {
  grades: Grades[];
}

export interface StudentFilter {
  status?: StudentStatus;
}
