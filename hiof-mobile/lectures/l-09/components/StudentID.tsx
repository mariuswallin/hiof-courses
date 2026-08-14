import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import type { Student, Theme } from "../types";

export default function StudentID({
  student,
  theme,
}: {
  student: Student;
  theme: Theme;
}) {
  // Destructure the student object for easier access to its properties
  const { id, isActive, role, name, program, expireAt } = student;
  // Destructure the theme object to get at the colors
  const { primary, secondary } = theme;
  // Check admin status for conditional rendering
  const isAdmin = role === "Admin";

  return (
    <View>
      {/* Conditional: only shown when the student is inactive */}
      {!isActive && <Text style={styles.inactiveLabel}>Inaktiv</Text>}
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          {/* Theme secondary color for the border around the image */}
          <Image
            source={{ uri: "https://placehold.co/100/jpg" }}
            style={[styles.image, { borderColor: secondary }]}
          />
          {/* Badge with the student's role, in theme colors */}
          <View style={[styles.roleTag, { backgroundColor: secondary }]}>
            <Text style={styles.roleText}>{role}</Text>
          </View>
        </View>
        {/* Theme primary color for the title */}
        <Text style={[styles.title, { color: primary }]}>STUDENT ID</Text>
        <Text style={styles.name}>{name}</Text>

        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Studentnr:</Text>
            <Text style={styles.value}>{id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Program:</Text>
            <Text style={styles.value}>{program}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Gyldig til:</Text>
            {/* Conditional styling based on admin status and activity */}
            <Text
              style={[
                styles.value,
                isAdmin && styles.adminText,
                { fontWeight: isActive ? "bold" : "normal" },
              ]}
            >
              {expireAt}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.footer}>
        <View style={styles.barcode} />
        <Text style={styles.idText}>ID: {id}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  adminText: {
    color: "red",
    fontWeight: "bold",
  },
  content: {
    padding: 20,
    alignItems: "center",
  },
  imageContainer: {
    position: "relative",
    marginBottom: 20,
    alignItems: "center",
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
  },
  roleTag: {
    position: "absolute",
    bottom: 0,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  roleText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
  },
  infoBox: {
    backgroundColor: "#f9f9f9",
    width: "100%",
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
  },
  infoRow: {
    position: "relative",
    flexDirection: "row",
    marginBottom: 8,
  },
  label: {
    width: 80,
    fontWeight: "bold",
    fontSize: 14,
  },
  value: {
    flex: 1,
    fontSize: 14,
  },
  inactiveLabel: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "red",
    color: "white",
    padding: 5,
    borderRadius: 5,
    fontSize: 12,
    textTransform: "uppercase",
  },
  footer: {
    padding: 15,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  barcode: {
    height: 30,
    width: "70%",
    backgroundColor: "#333",
    marginBottom: 10,
  },
  idText: {
    fontSize: 12,
    color: "#666",
  },
});
