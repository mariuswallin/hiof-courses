// app/(modals)/remove-student.tsx

import { router, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Students } from "../../constants/students";
import { Ionicons } from "@expo/vector-icons";
import { Theme } from "../../constants/theme";

export default function Remove() {
  // Read the id from the URL parameters, as before
  const { id } = useLocalSearchParams();
  const student = Students.find((student) => student.id === id);

  // Handle removing a student. Usually an API or another function is called to
  // update the state.
  const handleRemoveStudent = (id: string) => {
    console.log(`Removing student with id: ${id}`);
    handleCloseModal();
  };

  // Used to close the modal / navigate back
  const handleCloseModal = () => router.canGoBack() && router.back();

  return (
    <View style={styles.modalContainer}>
      <Pressable onPress={handleCloseModal} style={styles.backButton}>
        <Ionicons name="arrow-back" size={35} color={Theme.primary} />
      </Pressable>
      <View style={styles.contentView}>
        <View>
          {student ? (
            <Pressable
              onPress={() => handleRemoveStudent(student.id)}
              style={styles.removeButton}
            >
              <Text style={styles.buttonText}>
                Click here to remove {student.name}
              </Text>
            </Pressable>
          ) : (
            <Text>Student not found</Text>
          )}
          <Pressable onPress={handleCloseModal} style={styles.button}>
            <Text style={styles.buttonText}>Avbryt</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const buttonStyle = StyleSheet.create({
  button: {
    backgroundColor: Theme.primary,
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

const styles = StyleSheet.create({
  ...buttonStyle,
  backButton: {
    position: "absolute",
    top: 15,
    left: 15,
    zIndex: 10,
  },
  contentView: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    zIndex: 2,
  },
  removeButton: {
    ...buttonStyle.button,
    backgroundColor: Theme.danger,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00000040",
    zIndex: 2,
  },
});
