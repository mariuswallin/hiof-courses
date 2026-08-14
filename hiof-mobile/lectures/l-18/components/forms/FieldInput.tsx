// components/forms/FieldInput.tsx

import type { ReactFormExtendedApi } from "@tanstack/react-form";
import {
  Text,
  TextInput,
  View,
  type TextStyle,
  type ViewStyle,
  StyleSheet,
} from "react-native";
import { FieldErrors } from "./FieldError";

export const FieldInput = ({
  form,
  name,
  label,
  placeholder,
  validator,
  styles,
}: {
  // Uses the type from useForm. `any` here, though it should be more specific.
  form: ReactFormExtendedApi<any, any, any, any, any, any, any, any, any, any, any, any>;
  // Validator function for the field
  validator?: (value: unknown) => boolean;
  name: string;
  label: string;
  placeholder: string;
  styles?: {
    container?: ViewStyle;
    label?: TextStyle;
    input?: TextStyle;
    error?: {
      input: TextStyle;
      text: TextStyle;
    };
  };
}) => {
  // Merge with the default styles so every style is available
  const formFieldStyles = {
    ...defaultStyles,
    errorInput: defaultStyles.errorInput ?? styles?.error?.input,
    errorText: defaultStyles.errorText ?? styles?.error?.text,
    ...(styles ?? {}),
  };

  return (
    <form.Field
      name={name}
      // If there is a validator, run it on change
      {...(validator
        ? { validators: { onChange: ({ value }) => validator(value) } }
        : {})}
      children={(field) => (
        <View style={formFieldStyles.container}>
          <Text style={formFieldStyles.label}>{label}:</Text>
          <TextInput
            style={[
              formFieldStyles.input,
              !field.state.meta.isValid &&
                field.state.meta.isTouched &&
                formFieldStyles.errorInput,
            ]}
            value={field.state.value as string}
            onChangeText={field.handleChange}
            onBlur={field.handleBlur}
            placeholder={placeholder}
          />
          {/* Uses a dedicated component to show errors */}
          <FieldErrors
            meta={field.state.meta}
            styles={{
              error: formFieldStyles.errorText,
            }}
          />
        </View>
      )}
    />
  );
};

const defaultStyles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 5,
    color: "#002266",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    backgroundColor: "#fff",
    color: "#002266",
  },
  errorInput: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
});
