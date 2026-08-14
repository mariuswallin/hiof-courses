// components/forms/StudentForm.tsx

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ActivityIndicator,
  type SwitchChangeEvent,
  TouchableOpacity,
} from "react-native";
import { useForm, type StandardSchemaV1 } from "@tanstack/react-form";

import { FieldInput } from "./FieldInput";
import { DatePickerField } from "./DateField";
import { FieldPicker } from "./FieldPicker";
import { StudentSchema, type Student } from "../../types";

import { cn } from "@/utils/cn";
import { PictureField } from "./PictureField";
import { useFormContext } from "@/context/FormContextReducer";

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

type StudentFormProps = {
  onSubmit: (student: Student) => Promise<boolean>;
  initialValues?: Partial<Student>;
};

export function StudentForm({
  onSubmit,
  initialValues = {},
}: StudentFormProps) {
  const [submissionResult, setSubmissionResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const { dispatch } = useFormContext();
  // Shows that the form re-renders when the data changes
  console.log("Rerendering StudentForm with initial values:", initialValues);

  const form = useForm({
    defaultValues: {
      id: 0,
      name: "",
      program: "",
      expireAt: new Date(Date.now()).toISOString(),
      isActive: false,
      ...initialValues,
    },
    onSubmit: async ({ value }) => {
      try {
        console.log("Submitting form with values:", value);

        const success = await onSubmit(value);

        setSubmissionResult({
          success,
          message: success
            ? "Student ble registrert!"
            : "Kunne ikke registrere student. Prøv igjen senere.",
        });

        if (success) {
          form.reset();
          setTimeout(() => {
            setSubmissionResult(null);
          }, 3000);
        }
      } catch (error) {
        setSubmissionResult({
          success: false,
          message: "En feil oppstod under registrering. Prøv igjen senere.",
        });
      }
    },
    validators: {
      onChangeAsyncDebounceMs: 500, // Delay update med 500ms
      onChangeAsync: ({ value }) => {
        // Holds state globally so other components can use it. It is reset when we
        // navigate away from the screen, but the option is there.
        dispatch({
          type: "UPDATE_FORM_DATA",
          payload: value,
        });
      },
      onSubmit: StudentSchema as unknown as StandardSchemaV1<Student>,
    },
  });

  const shape = StudentSchema.shape;

  return (
    <View style={styles.container}>
      <Text style={styles.title} className="mt-2">
        Registrer ny student
      </Text>

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
      <View className="flex-1 gap-5">
        <FieldInput
          form={form}
          name="id"
          type="numeric"
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
        <form.Field
          name="image"
          children={(field) => (
            <PictureField
              label="Legg til bilde"
              onFieldChange={field.handleChange}
              value={field.state.value}
              meta={field.state.meta}
            />
          )}
        />
        <form.Subscribe
          selector={(state) => [state.isSubmitting]}
          children={([formIsSubmitting]) => (
            <View style={styles.submitContainer}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => form.handleSubmit()}
                disabled={formIsSubmitting}
              >
                <Text
                  className={cn(
                    "bg-blue-100 px-8 py-4 rounded-md text-center mb-14 mt-5",
                    formIsSubmitting
                      ? "text-blue-500"
                      : "text-blue-800 font-semibold"
                  )}
                >
                  {formIsSubmitting ? (
                    <ActivityIndicator style={styles.spinner} />
                  ) : null}
                  Registrer student
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    position: "relative",
    paddingBottom: 60,
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
  },
  spinner: {
    marginLeft: 10,
  },
});
