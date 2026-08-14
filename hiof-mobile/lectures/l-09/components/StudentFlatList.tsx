import { FlatList } from "react-native";
import StudentID from "../components/StudentID";
import type { Student, Theme } from "../types";
import Card from "./BaseCard";

type StudentListProps = {
  students: Student[];
  theme: Theme;
};

export default function StudentFlatList(props: StudentListProps) {
  const { students, theme } = props;
  return (
    <FlatList
      // The data source to render
      data={students}
      // Generates a unique key for each item
      keyExtractor={(item) => item.id}
      // Defines how each item in the list is rendered
      renderItem={({ item }) => (
        <Card key={item.id} theme={theme} title={item.name}>
          <StudentID student={item} theme={theme} />
        </Card>
      )}
      // Space between list items (25 pixels)
      contentContainerStyle={{ gap: 25 }}
      // Hide the vertical scrollbar for a cleaner look
      showsVerticalScrollIndicator={false}
      // Hide the horizontal scrollbar (even though this list is vertical)
      showsHorizontalScrollIndicator={false}
      // Makes the FlatList fill the space available in the parent
      style={{ flex: 1 }}
    />
  );
}
