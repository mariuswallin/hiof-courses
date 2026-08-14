import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Switch,
} from "react-native";
import { useForm } from "@tanstack/react-form";
import * as z from "zod";

// Validation schema defined with Zod
const studentSchema = z.object({
  id: z.string().min(1, { message: "Student ID er påkrevd" }),
  name: z.string().min(1, { message: "Navn er påkrevd" }),
  program: z.string().min(1, "Program er påkrevd"),
  expireAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Ugyldig datoformat (YYYY-MM-DD)"),
  role: z.string().min(1, "Rolle er påkrevd"),
  isActive: z.boolean(),
});

type Student = z.infer<typeof studentSchema>;

export default function StudentFormWithZod() {
  const form = useForm({
    defaultValues: {
      id: "",
      name: "",
      program: "",
      expireAt: "",
      role: "",
      isActive: false,
    },
    onSubmit: async ({ value }) => {
      console.log("Student data:", value);
      // Normally we would send the data to an API here
    },
    // Validation can happen here, or per field as shown below
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrer ny student</Text>

      <form.Field
        name="id"
        validators={{
          onChange: studentSchema.shape.id, // Bruk Zod-validering
        }}
        children={(field) => (
          <View>
            <Text style={styles.label}>Student ID:</Text>
            <TextInput
              style={styles.input}
              value={field.state.value}
              onChangeText={(value) => field.handleChange(value)}
              placeholder="Skriv inn student ID"
            />
            {/* Shows an error message when the field is invalid */}
            {!field.state.meta.isValid &&
              field.state.meta.errors.length > 0 && (
                <Text style={styles.error}>
                  {field.state.meta.errors[0]?.message}
                </Text>
              )}
          </View>
        )}
      />

      <form.Field
        name="name"
        validators={{
          onChange: studentSchema.shape.name,
        }}
        children={(field) => (
          <View>
            <Text style={styles.label}>Navn:</Text>
            <TextInput
              style={styles.input}
              value={field.state.value}
              onChangeText={(value) => field.handleChange(value)}
              placeholder="Skriv inn navn"
            />
            {!field.state.meta.isValid &&
              field.state.meta.errors.length > 0 && (
                <Text style={styles.error}>
                  {field.state.meta.errors[0]?.message}
                </Text>
              )}
          </View>
        )}
      />

      {/* Similar setup for the other fields, simplified below */}
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
  // Same as before, plus a style for error messages
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
    marginBottom: 5, // Redusert for å gi plass til feilmeldinger
  },
  switchContainer: {
    marginBottom: 20,
  },
  switch: {},
  error: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
  },
});
