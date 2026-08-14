import { FlatList, StyleSheet } from "react-native";
import StudentIDNoPress from "./StudentIDNoPress";
import type { Student, Theme } from "../types";
import Card from "./BaseCard";
import CustomPress from "./CustomPress";

type StudentListProps = {
  students: Student[];
  theme: Theme;
  onStudentPress?: (id: string) => void; // New prop for handling presses
};

export default function StudentFlatList(props: StudentListProps) {
  const { students, theme, onStudentPress } = props;
  return (
    <FlatList
      // The data source to render
      data={students}
      // Generates a unique key for each item
      keyExtractor={(item) => item.id}
      // Defines how each item in the list is rendered
      renderItem={({ item }) => (
        <CustomPress
          onPress={() => onStudentPress?.(item.id)}
          style={styles.cardPress}
        >
          <Card key={item.id} theme={theme} title={item.name}>
            <StudentIDNoPress student={item} theme={theme} />
          </Card>
        </CustomPress>
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

const styles = StyleSheet.create({
  cardPress: {
    borderRadius: 8,
    overflow: "hidden",
  },
});
