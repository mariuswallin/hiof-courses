import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Link, useRouter } from "expo-router";
import StudentListItem from "../../components/StudentListItem";
// Imports a list of students from a constants file; normally this would be an
// API call or a database query
import { Students as StudentData } from "../../constants/students";

export default function Students() {
  // Get the router object for programmatic navigation
  const router = useRouter();

  // Navigate to the student details with useRouter
  const navigateToStudent = (id: string) => {
    // Navigate to the dynamic route with the id as a parameter
    router.push(`/students/${id}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Studentliste</Text>

      {/* METHOD 1: list view with StudentListItem and programmatic navigation */}
      {/* <Text style={styles.sectionTitle}>Navigasjon med useRouter:</Text>
      <FlatList
        data={students.slice(0, 2)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          // On press, useRouter navigates programmatically
          <CustomPress onPress={() => navigateToStudent(item.id)}>
            <StudentListItem student={item}  />
          </CustomPress>
        )}
        style={styles.list}
      /> */}

      {/* METHOD 2: list view with the Link component, declarative navigation */}
      <Text style={styles.sectionTitle}>Navigasjon med Link-komponenten:</Text>
      <View style={styles.list}>
        {StudentData.map((student) => (
          <Link
            key={student.id}
            // Here we use href directly with the relevant ID
            href={`/students/${student.id}`}
          >
            <StudentListItem student={student} />
          </Link>
        ))}
      </View>

      {/* Link back to the home page */}
      <Link href="/" style={styles.link}>
        <Text style={styles.linkText}>Tilbake til forsiden</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 20,
    color: "#002266",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    alignSelf: "flex-start",
    marginTop: 15,
    marginBottom: 10,
    color: "#002266",
  },
  list: {
    width: "100%",
    marginBottom: 15,
  },
  link: {
    backgroundColor: "#002266",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
    width: "100%",
  },
  linkText: {
    color: "white",
    fontWeight: "bold",
  },
});
