import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams, Link } from "expo-router";
import StudentIDNoPress from "../../components/StudentIDNoPress";
// Imports a list of students from a constants file; normally this would be an
// API call or a database query
import { Students } from "../../constants/students";
import { Theme } from "../../constants/theme";

// Kept local — it is not used elsewhere and is specific to this component
const EmptyStudent = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.error}>Ingen student funnet.</Text>
      <Link href="/students" style={styles.link}>
        <Text style={styles.linkText}>Tilbake til studentlisten</Text>
      </Link>
    </View>
  );
};

export default function StudentDetailScreen() {
  // useLocalSearchParams reads the ID parameter out of the URL
  const { id } = useLocalSearchParams();

  // Find the student with this ID
  const student = Students.find((s) => s.id === id);

  // Handle the case where the student is not found
  if (!student) {
    return <EmptyStudent />;
  }

  return (
    <View style={styles.container}>
      <StudentIDNoPress student={student} />
      {/* Link back to the list page */}
      <Link href="/students" style={styles.link}>
        <Text style={styles.linkText}>Tilbake til studenter</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Theme.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 20,
    color: "#002266",
  },
  error: {
    fontSize: 16,
    color: "red",
    marginBottom: 20,
  },

  link: {
    backgroundColor: "#002266",
    padding: 15,
    borderRadius: 8,
    marginVertical: 8,
    alignItems: "center",
  },
  linkText: {
    color: "white",
    fontWeight: "bold",
  },
});
