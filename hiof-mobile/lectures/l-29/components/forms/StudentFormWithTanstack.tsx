import {
  View,
  Text,
  TextInput,
  Switch,
  Button,
  StyleSheet,
} from "react-native";
import { useForm } from "@tanstack/react-form";

export default function StudentFormWithTanStack() {
  // Create the form instance with TanStack Form.
  // The type is inferred from defaultValues (TanStack Form v1).
  const form = useForm({
    // The form's fields and their default values
    defaultValues: {
      id: "",
      name: "",
      program: "",
      expireAt: "",
      role: "",
      isActive: false,
    },
    // Function used when the form is submitted
    onSubmit: async ({ value }) => {
      console.log("Student data:", value);
      // Normally we would send the data to an API here
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrer ny student</Text>

      {/* form.Field component that handles each field */}
      <form.Field
        name="id" // Field name in the form (from defaultValues)
        // The children prop is a function giving access to the field state and handlers
        children={(field) => (
          <View>
            <Text style={styles.label}>Student ID:</Text>
            <TextInput
              style={styles.input}
              // Read the value from the field state (the student ID here)
              value={field.state.value}
              // Handle text field changes. field.handleChange updates the field state with
              // the new value — the id in this case.
              onChangeText={(value) => field.handleChange(value)}
              placeholder="Skriv inn student ID"
            />
          </View>
        )}
      />
      <form.Field
        name="name"
        children={(field) => (
          <View>
            <Text style={styles.label}>Navn:</Text>
            <TextInput
              style={styles.input}
              value={field.state.value}
              onChangeText={(value) => field.handleChange(value)}
              placeholder="Skriv inn navn"
            />
          </View>
        )}
      />

      <form.Field
        name="program"
        children={(field) => (
          <View>
            <Text style={styles.label}>Program:</Text>
            <TextInput
              style={styles.input}
              value={field.state.value}
              onChangeText={(value) => field.handleChange(value)}
              placeholder="Skriv inn studieprogram"
            />
          </View>
        )}
      />

      <form.Field
        name="expireAt"
        children={(field) => (
          <View>
            <Text style={styles.label}>Utløpsdato:</Text>
            <TextInput
              style={styles.input}
              value={field.state.value}
              onChangeText={(value) => field.handleChange(value)}
              placeholder="YYYY-MM-DD"
            />
          </View>
        )}
      />

      <form.Field
        name="role"
        children={(field) => (
          <View>
            <Text style={styles.label}>Rolle:</Text>
            <TextInput
              style={styles.input}
              value={field.state.value}
              onChangeText={(value) => field.handleChange(value)}
              placeholder="Skriv inn rolle"
            />
          </View>
        )}
      />

      <form.Field
        name="isActive"
        children={(field) => (
          <View style={styles.switchContainer}>
            <Text style={styles.label}>Aktiv:</Text>
            <Switch
              value={field.state.value}
              style={styles.switch}
              onValueChange={(value) => field.handleChange(value)}
            />
          </View>
        )}
      />

      <Button title="Registrer student" onPress={() => form.handleSubmit()} />
    </View>
  );
}

const styles = StyleSheet.create({
  // Same as before
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
