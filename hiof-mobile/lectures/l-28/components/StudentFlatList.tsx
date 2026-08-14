// components/StudentFlatList.tsx

import { useCallback } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import StudentID from "./StudentID";
import type { StudentWithId } from "../types";
import Card from "./BaseCard";
import CustomPress from "./CustomPress";
import { Link } from "expo-router";
import StudentListItem from "./StudentListItem";

type StudentListProps = {
  students: StudentWithId[];
  preview: boolean;
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetching?: boolean;
  onRefresh?: () => void; // Function that refreshes the list
  refreshing?: boolean;
};

export default function StudentFlatList(props: StudentListProps) {
  const {
    students,
    preview = false,
    onRefresh,
    refreshing,
    fetchNextPage,
    hasNextPage,
    isFetching,
  } = props;

  const renderHeader = useCallback(
    () => (
      <View>
        <Text className="font-bold text-xl text-blue-700">Studentliste</Text>
      </View>
    ),
    []
  );

  // Footer showing a loading indicator while more items are fetched
  const renderFooter = useCallback(
    () =>
      isFetching ? (
        <View className="py-4 items-center">
          <ActivityIndicator size="small" />
          <Text>Laster studenter...</Text>
        </View>
      ) : students.length && !hasNextPage ? (
        <View className="py-4 items-center">
          <Text>Ingen flere studenter å laste</Text>
        </View>
      ) : null,
    [isFetching, hasNextPage, students.length]
  );

  // Component rendered when the list is empty
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
      keyExtractor={(item) => `${item.$id}`}
      renderItem={({ item }) =>
        preview ? (
          <Link href={`/students/${item.$id}`}>
            <StudentListItem student={item} />
          </Link>
        ) : (
          <CustomPress className="border-rounded-lg overflow-hidden">
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
      // Enables pull-to-refresh
      refreshing={refreshing}
      onRefresh={onRefresh ? onRefresh : undefined}
      // Enables "load more" when the user reaches the bottom of the list
      onEndReached={() => {
        if (!isFetching && hasNextPage && fetchNextPage) {
          fetchNextPage();
        }
      }}
      // How close to the bottom the user must be before onEndReached fires (0-1)
      onEndReachedThreshold={0.3}
      // Rendered at the top of the list
      ListHeaderComponent={renderHeader}
      // Rendered at the bottom of the list
      ListFooterComponent={renderFooter}
      // Rendered when the list is empty
      ListEmptyComponent={renderEmptyComponent}
    />
  );
}
