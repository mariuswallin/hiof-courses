// components/forms/StudentFormWithIndividualState.tsx

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Switch,
  Button,
  StyleSheet,
} from "react-native";
// Local type for the form state — every field a string, for the TextInputs
type StudentFormState = {
  id: string;
  name: string;
  program: string;
  expireAt: string;
  role: string;
  isActive: boolean;
};

export default function StudentFormWithIndividualState() {
  // Separate state variables per field
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [program, setProgram] = useState("");
  const [expireAt, setExpireAt] = useState("");
  const [role, setRole] = useState("");
  const [isActive, setIsActive] = useState(false);

  const handleSubmit = () => {
    // Collect every value into one student object
    const student: StudentFormState = {
      id,
      name,
      program,
      expireAt,
      role,
      isActive,
    };

    console.log("Student data:", student);
    // Normally we would send the data to an API here
    // or do something else with the data
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrer ny student</Text>

      <Text style={styles.label}>Student ID:</Text>
      <TextInput
        style={styles.input}
        value={id}
        onChangeText={setId}
        placeholder="Skriv inn student ID"
      />

      <Text style={styles.label}>Navn:</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Skriv inn navn"
      />

      <Text style={styles.label}>Program:</Text>
      <TextInput
        style={styles.input}
        value={program}
        onChangeText={setProgram}
        placeholder="Skriv inn studieprogram"
      />

      <Text style={styles.label}>Utløpsdato:</Text>
      <TextInput
        style={styles.input}
        value={expireAt}
        onChangeText={setExpireAt}
        placeholder="YYYY-MM-DD"
      />

      <Text style={styles.label}>Rolle:</Text>
      <TextInput
        style={styles.input}
        value={role}
        onChangeText={setRole}
        placeholder="Skriv inn rolle"
      />

      <View style={styles.switchContainer}>
        <Text style={styles.label}>Aktiv:</Text>
        <Switch
          value={isActive}
          style={styles.switch}
          onValueChange={setIsActive}
        />
      </View>

      <Button title="Registrer student" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  switchContainer: {
    marginBottom: 20,
  },
  switch: {},
});
