// app/(admin)/(students)/add.tsx

import { usePermissions } from "@/hooks/usePermissions";
import { StudentForm } from "../../../components/forms/StudentForm";

import type { Student } from "../../../types";
import { Redirect } from "expo-router";

export default function Add() {
  // Our own hook checks whether the user has access
  const { hasPermissions, isLoading } = usePermissions();

  // Show an empty screen until the permission check has run
  if (isLoading) return <></>;

  // Without permission, navigate to the access screen
  if (!hasPermissions) return <Redirect href={"(zShared)/access"} />;

  const createStudent = (student: Student): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Student data sent to API:", student);
        resolve(true);
      }, 2000);
    });
  };

  return <StudentForm onSubmit={createStudent} />;
}
