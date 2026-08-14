// app/(admin)/(students)/list.tsx

import React from "react";
import { Text, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";

import CustomView from "../../../components/CustomView";
import { Theme } from "../../../constants/theme";
import { useQuery } from "@tanstack/react-query";
import { getStudents } from "@/providers/appwrite/database";

import StudentFlatList from "@/components/StudentFlatList";

export default function Students() {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["students"],
    queryFn: getStudents,
  });

  // Vis feilmelding hvis noe gikk galt
  if (isError || !data?.success) {
    const errorMessage = data?.success
      ? error?.message
      : data?.error ||
        error?.message ||
        "Det oppstod en feil under henting av studenter. Vennligst prøv igjen senere.";

    return (
      <CustomView safeArea className="flex-1 items-center justify-center">
        <Text className="text-red-500 text-lg">{errorMessage}</Text>
      </CustomView>
    );
  }

  const students = data?.data || [];

  return (
    <CustomView safeArea className="flex-1 align-center bg-gray-200 p-5">
      <Stack.Screen options={{ title: "List" }} />
      <StudentFlatList
        preview
        students={students}
        onRefresh={refetch}
        refreshing={isPending}
      />
    </CustomView>
  );
}
