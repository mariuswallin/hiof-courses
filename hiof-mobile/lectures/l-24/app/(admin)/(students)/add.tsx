// app/(admin)/(students)/add.tsx

import { usePermissions } from "@/hooks/usePermissions";
import { StudentForm } from "../../../components/forms/StudentForm";
import type { Student } from "../../../types";
// import { hash } from "ohash"; // Not used, but handy for forcing a re-render
import { Redirect, useIsFocused } from "expo-router";
import Admin from "@/components/auth/Admin";
import Authenticated from "@/components/auth/Authenticated";


export default function Add() {
  // Our own hook checks whether the user has access
  const { hasPermissions, isLoading } = usePermissions();
  const isFocused = useIsFocused();

  // Show an empty screen until the permission check has run
  if (isLoading) return <></>;
    // </Authenticated>

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

  // Return null when the screen is not focused. That resets the form when we
  // navigate away; otherwise the field state lives on and can cause bugs.
  if (!isFocused) {
    return null;
  }

  return (
    // <Authenticated>
    <StudentForm
      //key={hash(formData)} // Alternative way to force a re-render
      onSubmit={createStudent}
    />
  );
}
