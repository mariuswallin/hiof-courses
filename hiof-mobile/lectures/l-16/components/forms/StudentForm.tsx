// components/forms/StudentForm.tsx

import { useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Switch,
  ActivityIndicator,
  ScrollView,
  type SwitchChangeEvent,
} from "react-native";
import { useForm, type StandardSchemaV1 } from "@tanstack/react-form";

import { FieldInput } from "./FieldInput";
import { DatePickerField } from "./DateField";
import { FieldPicker } from "./FieldPicker";
import { StudentSchema, type Student } from "../../types";

import { Theme } from "../../constants/theme";

const PROGRAMS = [
  { label: "Informatikk", value: "informatikk" },
  { label: "Informasjonssystemer", value: "informasjonssystemer" },
  { label: "Digitale medier og design", value: "digitale-medier-og-design" },
  { label: "Annet", value: "annet" },
];

type SafeParseResult =
  | { success: true }
  | { success: false; error: { toString: () => string } };

const parseZodResult = (result: SafeParseResult) => {
  if (result.success) {
    return;
  }
  return JSON.parse(result.error.toString());
};

// Props type for the form component
type StudentFormProps = {
  // onSubmit returns a Promise<boolean> telling us whether the submit succeeded
  onSubmit: (student: Student) => Promise<boolean>;
  // Optional initialValues prop, to prefill the form with existing data
  initialValues?: Partial<Student>;
};

export function StudentForm({
  onSubmit,
  initialValues = {},
}: StudentFormProps) {
  // Tracks the submit status
  const [submissionResult, setSubmissionResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const form = useForm({
    defaultValues: {
      id: initialValues.id || "",
      name: initialValues.name || "",
      program: initialValues.program || "",
      expireAt: new Date(initialValues.expireAt ?? Date.now()).toISOString(),
      role: initialValues.role || "",
      isActive: initialValues.isActive || false,
      // Spread sist: gir 'other' som valgfri nøkkel, slik skjemaet har den
      ...initialValues,
    },
    onSubmit: async ({ value }) => {
      try {
        // Call onSubmit from props and wait for the result
        console.log("Submitting form with values:", value);
        const success = await onSubmit(value);

        // Handle the result
        setSubmissionResult({
          success,
          message: success
            ? "Student ble registrert!"
            : "Kunne ikke registrere student. Prøv igjen senere.",
        });

        // On success, reset the form (optional)
        if (success) {
          form.reset();
          setTimeout(() => {
            setSubmissionResult(null);
          }, 3000);
        }
      } catch (error) {
        // Handle any errors
        setSubmissionResult({
          success: false,
          message: "En feil oppstod under registrering. Prøv igjen senere.",
        });
      }
    },
    validators: {
      onSubmit: StudentSchema as unknown as StandardSchemaV1<Student>,
    },
  });

  const shape = StudentSchema.shape;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Registrer ny student</Text>

      {/* Shows the submit result */}
      {submissionResult && (
        <View
          style={[
            styles.resultContainer,
            {
              backgroundColor: submissionResult.success ? "#e6f7e6" : "#f7e6e6",
            },
          ]}
        >
          <Text style={styles.resultText}>{submissionResult.message}</Text>
        </View>
      )}

      <FieldInput
        form={form}
        name="id"
        label="Student ID"
        placeholder="Skriv inn student ID"
        validator={(value) => parseZodResult(shape.id.safeParse(value))}
      />
      <FieldInput
        form={form}
        name="name"
        label="Navn"
        placeholder="Skriv inn navn"
        validator={(value) => parseZodResult(shape.name.safeParse(value))}
      />
      <form.Field
        name="program"
        listeners={{
          onChange: ({ value }) => {
            console.log(
              `Program changed to: ${value}, resetting other-field errors`
            );
            // Clear the error on the "other" field when the program is not "annet".
            // Edge case: submit has been pressed with "annet" selected, and then the
            // selection changes.
            if (value && value !== "annet") {
              form.setFieldMeta("other", (prev) => ({
                ...prev,
                isTouched: false,
              }));
            }
          },
        }}
        validators={{
          onChange: shape.program,
        }}
        children={(field) => (
          <FieldPicker
            label="Studieprogram"
            onFieldChange={field.handleChange}
            meta={field.state.meta}
            selectedValue={field.state.value}
            options={PROGRAMS}
          >
            {/* Shows the "annet" field when the program is "annet" */}
            {/* Form.subscribe re-renders when the value it listens to changes */}
            <form.Subscribe
              selector={(state) => state.values.program}
              children={(program) =>
                program === "annet" ? (
                  <FieldInput
                    form={form}
                    name="other"
                    label="Annet program"
                    placeholder="Skriv inn annet program"
                  />
                ) : null
              }
            />
          </FieldPicker>
        )}
      />
      <DatePickerField form={form} name="expireAt" label="Utløpsdato" />
      <FieldInput
        form={form}
        name="role"
        label="Rolle"
        placeholder="Skriv inn rolle"
        validator={(value) => parseZodResult(shape.role.safeParse(value))}
      />
      <form.Field
        name="isActive"
        children={(field) => (
          <View style={styles.switchContainer}>
            <Text style={styles.label}>Aktiv:</Text>
            <Switch
              value={field.state.value}
              style={styles.switch}
              onChange={(event: SwitchChangeEvent) => {
                field.handleChange(event.nativeEvent.value);
              }}
            />
          </View>
        )}
      />
      {/* Submit button with a loading indicator */}
      {/* Uses a selector from the form state */}
      {/* which lets us pull out specific values */}
      {/* .Subscribe re-renders on changes in the selected state */}
      {/* this part */}
      <form.Subscribe
        selector={(state) => [state.isSubmitting]}
        children={([formIsSubmitting]) => (
          <View style={styles.submitContainer}>
            <Button
              title="Registrer student"
              color={formIsSubmitting ? Theme.secondary : Theme.primary}
              onPress={() => form.handleSubmit()}
              disabled={formIsSubmitting}
            />
            {formIsSubmitting && <ActivityIndicator style={styles.spinner} />}
          </View>
        )}
      />
    </ScrollView>
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
  fieldContainer: {
    marginBottom: 15,
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
  },
  inputError: {
    borderColor: "red",
  },
  switchContainer: {
    marginBottom: 20,

    flexDirection: "column",
    alignItems: "flex-start",
  },
  switch: {},
  error: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
  resultContainer: {
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  resultText: {
    textAlign: "center",
  },
  submitContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  spinner: {
    marginLeft: 10,
  },
});
