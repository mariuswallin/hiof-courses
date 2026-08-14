// components/forms/StudentForm.tsx

import { useEffect, useState } from "react";
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
import { useNavigation } from "expo-router";

type SafeParseResult =
  | { success: true }
  | { success: false; error: { toString: () => string } };

const PROGRAMS = [
  { label: "Informatikk", value: "informatikk" },
  { label: "Informasjonssystemer", value: "informasjonssystemer" },
  { label: "Digitale medier og design", value: "digitale-medier-og-design" },
  { label: "Annet", value: "annet" },
];

const parseZodResult = (result: SafeParseResult) => {
  if (result.success) {
    return;
  }
  return JSON.parse(result.error.toString());
};

type StudentFormProps = {
  onSubmit: (student: Student) => Promise<void>;
  initialValues?: Partial<Student>;
  mode?: "create" | "edit";
};

export function StudentForm({
  onSubmit,
  initialValues = {},
  mode = "create",
}: Readonly<StudentFormProps>) {
  const [submissionResult, setSubmissionResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const { state, dispatch } = useFormContext();
  const navigation = useNavigation();

  // Shows that the form re-renders when the data changes
  console.log("Rerendering StudentForm with values:", initialValues, state);

  const form = useForm({
    defaultValues: {
      id: 1111111,
      name: "",
      program: "",
      expireAt: new Date(Date.now()).toISOString(),
      isActive: false,
      image: null,
      ...state.data,
      ...initialValues,
    },
    onSubmit: async ({ value }) => {
      try {
        console.log("Submitting form with values:", value);
        // userId kommer inn via initialValues fra add.tsx
        await onSubmit(value);
      } catch (error) {
        console.error("Feil ved registrering av student:", error);
        setSubmissionResult({
          success: false,
          message: "En feil oppstod under registrering. Prøv igjen senere.",
        });
      } finally {
        dispatch({ type: "RESET_FORM" });
        form.reset();
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
      // zod v4 schema used as a Standard Schema validator (gives per-field errors
      // plus refine).
      // Narrow, typed cast because coerce gives an input type of `unknown`, not the
      // schema data's `number`.
      onSubmit: StudentSchema as unknown as StandardSchemaV1<Student>,
    },
  });

  useEffect(() => {
    const stateImage = state.data?.image;
    if (stateImage && stateImage !== form.state.values.image) {
      form.setFieldValue("image", stateImage);
      dispatch({ type: "SET_IMAGE", payload: null });
    }
  }, [state.data?.image, dispatch, form]);

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
                `Program changed to: ${value}, resetting other-field errors`,
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
        >
          {(field) => (
            <FieldPicker
              label="Studieprogram"
              onFieldChange={field.handleChange}
              meta={field.state.meta}
              selectedValue={field.state.value}
              options={PROGRAMS}
            >
              <form.Subscribe selector={(state) => state.values.program}>
                {(program) =>
                  program === "annet" ? (
                    <FieldInput
                      form={form}
                      name="other"
                      label="Annet program"
                      placeholder="Skriv inn annet program"
                    />
                  ) : null
                }
              </form.Subscribe>
            </FieldPicker>
          )}
        </form.Field>
        <DatePickerField form={form} name="expireAt" label="Utløpsdato" />
        <form.Field name="isActive">
          {(field) => (
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
        </form.Field>
        <form.Field name="image">
          {(field) => (
            <PictureField
              label="Legg til bilde"
              onFieldChange={(value) => {
                field.handleChange(value);
                dispatch({
                  type: "SET_IMAGE",
                  payload: value,
                });
              }}
              value={field.state.value}
              meta={field.state.meta}
            >
              <TouchableOpacity
                onPress={() => {
                  navigation.dispatch({ type: "OPEN_DRAWER" });
                }}
                className={cn(
                  "bg-slate-700 py-4 mt-3 rounded-sm flex items-center justify-center",
                )}
              >
                <Text className="text-white">Eller velg et bilde</Text>
              </TouchableOpacity>
            </PictureField>
          )}
        </form.Field>

        <form.Subscribe selector={(state) => [state.isSubmitting]}>
          {([formIsSubmitting]) => (
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
                      : "text-blue-800 font-semibold",
                  )}
                >
                  {formIsSubmitting ? (
                    <ActivityIndicator style={styles.spinner} />
                  ) : null}
                  {mode === "edit" ? "Oppdater student" : "Registrer student"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </form.Subscribe>
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
