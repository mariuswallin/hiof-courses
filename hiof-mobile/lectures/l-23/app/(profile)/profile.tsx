// app/(profile)/profile.tsx

// Reuses the StudentID component
import StudentID from "@/components/StudentID";
import { Students } from "@/constants/students";
import { useAuth } from "@/context/AuthProvider";

// Normally we would call an API to fetch the students
const getStudentIdFromUser = (id?: string) => {
  if (!id) {
    return null;
  }
  return Students.find((student) => student.userId === id);
};

export default function Profile() {
  const { user } = useAuth();
  const student = getStudentIdFromUser(user?.id);
  if (!student) {
    return null;
  }
  return <StudentID student={student} />;
}
