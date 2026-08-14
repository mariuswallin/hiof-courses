// components/forms/FieldError.tsx

import { Text, type TextStyle } from "react-native";

import type { AnyFieldMeta } from "@tanstack/react-form";

type FieldErrorsProps = {
  meta: Partial<AnyFieldMeta>;
  styles?: {
    error: TextStyle;
  };
};

// Component that shows the errors for one field. It takes the field's meta
// information, styles it, and shows the errors once the field is touched.

export const FieldErrors = ({ meta, styles }: FieldErrorsProps) => {
  const formFieldStyles = {
    ...defaultStyles,
    ...(styles ?? {}),
  };

  // Use a unique list to avoid duplicate errors, and render them as a list
  const uniqueErrors = Array.from(new Set(meta.errors)).map((err) => ({
    error: err.message,
  }));

  if (!meta.isTouched) {
    return null;
  }

  return uniqueErrors.map(({ error }, index) => (
    <Text key={index} style={formFieldStyles.error}>
      {error}
    </Text>
  ));
};

const defaultStyles = {
  error: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
};
