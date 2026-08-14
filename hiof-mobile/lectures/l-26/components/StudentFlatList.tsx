// components/StudentFlatList.tsx

import { useCallback } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import StudentID from "./StudentID";
import type { Student } from "../types";
import Card from "./BaseCard";
import CustomPress from "./CustomPress";
import { Link } from "expo-router";
import StudentListItem from "./StudentListItem";

type StudentListProps = {
  students: Student[];
  onStudentPress?: (id: number) => void;
  preview?: boolean;
  onRefresh?: () => void; // Funksjon for å oppdatere listen
  refreshing?: boolean;
};

export default function StudentFlatList(props: StudentListProps) {
  const {
    students,
    onStudentPress,
    preview,
    onRefresh,
    refreshing,
  } = props;

  // Renderer en header (tittelen)
  const renderHeader = useCallback(
    () => (
      <View>
        <Text className="font-bold text-xl text-blue-700">Studentliste</Text>
      </View>
    ),
    []
  );

  // Renderer en footer
  const renderFooter = useCallback(
    () =>
      <View>
        <ActivityIndicator size="small" />
        <Text>Footer</Text>
      </View>,
    []
  );

  // Renderer en komponent når listen er tom
  const renderEmptyComponent = useCallback(
    () => (
      <View>
        <Text>Ingen studenter funnet</Text>
      </View>
    ),
    []
  );

  return (
    <FlatList
      data={students}
      keyExtractor={(item) => `${item.id}`}
      renderItem={({ item }) =>
        preview ? (
          <Link href={`/students/${item.id}`}>
            <StudentListItem student={item} />
          </Link>
        ) : (
          <CustomPress
            onPress={() => {
              if (onStudentPress) {
                onStudentPress(item.id);
              }
            }}
            className="border-rounded-lg overflow-hidden"
          >
            <Card>
              <StudentID student={item} />
            </Card>
          </CustomPress>
        )
      }
      contentContainerStyle={{
        gap: 25,
        paddingHorizontal: 16,
        paddingVertical: 20,
      }}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      style={{ flex: 1 }}
      refreshing={refreshing}
      onRefresh={onRefresh ? onRefresh : undefined}
      // Viser dette øverst i listen
      ListHeaderComponent={renderHeader}
      // Viser dette nederst i listen
      ListFooterComponent={renderFooter}
      // Viser dette når listen er tom
      ListEmptyComponent={renderEmptyComponent}
    />
  );
}
