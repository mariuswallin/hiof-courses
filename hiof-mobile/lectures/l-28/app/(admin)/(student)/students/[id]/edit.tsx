// app/(admin)/(student)/students/[id]/edit.tsx

import { useLocalSearchParams } from "expo-router";
import { ScrollView, Text } from "react-native";
import CustomView from "@/components/CustomView";

import { useStudentById, useUpdateStudent } from "@/hooks/useStudent";
import { StudentForm } from "@/components/forms/StudentForm";
import type { Student } from "@/types";
import Loading from "@/components/shared/Loading";
import ErrorComp from "@/components/shared/Error";

export default function Edit() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Pull out the state and data we need
  const { data: student, isPending, error, isError } = useStudentById(id);
  const mutation = useUpdateStudent(id);

  const handleUpdateStudent = async (values: Student) => {
    try {
      // onSubmit-proppen er Promise<void>: skjemaet leser ikke returverdien,
      // det er mutasjonens egen status som styrer UI-et.
      const result = await mutation.mutateAsync({ data: values });
      console.log(result);
    } catch (error) {
      console.error(error);
    } finally {
      console.log("done");
    }
  };

  // Are we updating or loading the student?
  if (isPending || mutation.isPending) {
    return <Loading />;
  }

  if (isError || mutation.isError) {
    return <ErrorComp message={error?.message || mutation.error?.message} />;
  }

  if (!student) {
    return (
      <CustomView safeArea className="flex-1">
        <Text>Fant ikke studenten med {id}</Text>
      </CustomView>
    );
  }

  // ScrollView is needed to be able to scroll. The student is passed as
  // initialValues so it can be edited.
  return (
    <ScrollView className="flex-1 h-full">
      <StudentForm initialValues={student} onSubmit={handleUpdateStudent} />
    </ScrollView>
  );
}
