// components/forms/FieldPicker.tsx

import {
  StyleSheet,
  Text,
  View,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { FieldErrors } from "./FieldError";
import Picker from "react-native-picker-select";
import { useState, type PropsWithChildren } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Theme } from "@/constants/theme";
import type { AnyFieldMeta } from "@tanstack/react-form";

type FieldPickerProps = {
  onFieldChange: (value: string) => void;
  selectedValue: string;
  label: string;
  meta?: Partial<AnyFieldMeta>;
  options: { label: string; value: string }[];
  styles?: {
    container?: ViewStyle;
    label?: TextStyle;
    input?: TextStyle;
    error?: {
      input: TextStyle;
      text: TextStyle;
    };
  };
};

export const FieldPicker = (props: PropsWithChildren<FieldPickerProps>) => {
  // Tracks whether the picker is open or closed
  const [isOpen, setIsOpen] = useState(false);
  const {
    onFieldChange,
    selectedValue,
    label,
    meta = {},
    styles,
    options,
    children,
  } = props;

  // Could be centralized — it is the same for every input field.
  const formFieldStyles = {
    ...defaultStyles,
    errorInput: defaultStyles.errorInput ?? styles?.error?.input,
    errorText: defaultStyles.errorText ?? styles?.error?.text,
    ...(styles ?? {}),
  };

  return (
    <View style={formFieldStyles.container}>
      <Text style={formFieldStyles.label}>{label}</Text>
      <Picker
        value={selectedValue.trim().toLowerCase()} // Strip whitespace and lowercase it
        onClose={() => setIsOpen(false)}
        onOpen={() => setIsOpen(true)}
        onValueChange={(value) => {
          // Check for a default value: form.reset changes it, which in turn triggers
          // validation.
          if (value === "" && !isOpen) {
            return;
          }
          console.log("Selected value:", value);
          onFieldChange(value);
        }}
        Icon={() => {
          return (
            <View>
              {isOpen ? (
                <Ionicons
                  style={formFieldStyles.icon}
                  name="chevron-up"
                  size={16}
                  color="gray"
                />
              ) : (
                <Ionicons
                  style={formFieldStyles.icon}
                  name="chevron-down"
                  size={16}
                  color="gray"
                />
              )}
            </View>
          );
        }}
        items={options} // The options shown in the picker
        useNativeAndroidPickerStyle={false}
        placeholder={{ label: `Velg ${label.toLowerCase()}`, value: "" }} // Placeholder
        darkTheme={false}
        style={{
          inputIOS: {
            ...inputStyles.inputIOS,
            ...(!selectedValue && {
              color: "#002266",
            }),
          },
          inputAndroid: {
            ...inputStyles.inputAndroid,
            ...(!selectedValue && {
              color: "#002266",
            }),
          },
          modalViewBottom: {
            backgroundColor: Theme.primary,
          },
          ...(meta.errors &&
            meta.errors?.length > 0 && {
              inputIOS: {
                ...inputStyles.inputIOS,
                ...formFieldStyles.errorInput,
                color: "red",
              },
              inputAndroid: {
                ...inputStyles.inputAndroid,
                ...formFieldStyles.errorInput,
                color: "red",
              },
            }),
          // Makes the whole field tappable
          iconContainer: {
            top: 0,
            right: 0,
            position: "absolute",
            flex: 1,
            width: "100%",
            height: "100%",
          },
        }}
      />
      <FieldErrors
        meta={meta}
        styles={{
          error: formFieldStyles.errorText,
        }}
      />
      {/* Links this field to others (such as "annet") */}
      {children}
    </View>
  );
};

const defaultStyles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 5,
    color: "#002266",
  },
  icon: {
    position: "absolute",
    right: 10,
    top: 10,
  },
  picker: {
    padding: 12,
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

// Styling has to be shaped this way to work with react-native-picker-select
const inputStyles = StyleSheet.create({
  inputIOS: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    backgroundColor: "#fff",
  },
  inputAndroid: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    backgroundColor: "#fff",
  },
});
