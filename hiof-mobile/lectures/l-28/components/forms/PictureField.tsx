// components/forms/PictureField.tsx

import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useState, type PropsWithChildren } from "react";
import type { AnyFieldMeta } from "@tanstack/react-form";
import { FieldErrors } from "./FieldError";
import { SharedCamera } from "../shared/Camera";
import PictureView from "../shared/PictureView";
import { Ionicons } from "@expo/vector-icons";
import { cn } from "@/utils/cn";
import { styled } from "nativewind";

type PictureFieldProps = {
  onFieldChange: (value: string | null) => void; // Function that updates the form value
  label: string; // Text label for the field
  value?: string | null; // Current image URI (optional)
  meta?: Partial<AnyFieldMeta>; // Metadata from TanStack Form (for validation)
};

// Wire Ionicons up to NativeWind (v5: styled)
const StyledIonicons = styled(Ionicons, {
  className: {
    target: "style",
    // react-native-css types the style->prop mapping too strictly for vector icons
    // @ts-expect-error – known type limitation; runs correctly (style.color -> color prop)
    nativeStyleToProp: {
      color: true,
    },
  },
});

export const PictureField = (props: PropsWithChildren<PictureFieldProps>) => {
  const { onFieldChange, value, label, meta = {}, children } = props;
  const [showCamera, setShowCamera] = useState(false);

  // Handle a picture being taken or changed
  const onSetImage = (image: string | null) => {
    setShowCamera(false);
    onFieldChange(image);
  };

  return (
    <>
      {/* Modal showing the camera when the user wants to take a picture */}
      <Modal visible={showCamera} onRequestClose={() => setShowCamera(false)}>
        <SharedCamera onSetImage={onSetImage} facing="back" />
      </Modal>

      <View style={styles.container}>
        <Text className="font-bold mb-5 text-[#002266]">{label}</Text>

        {/* Conditional rendering — shows either the image or a placeholder */}
        {value ? (
          <PictureView picture={value} setPicture={onSetImage} />
        ) : (
          <TouchableOpacity
            onPress={() => setShowCamera(true)}
            className={cn(
              "border-2 border-dashed border-gray-300 rounded-sm py-4 flex-1 flex-row items-center justify-center gap-2"
            )}
          >
            <StyledIonicons name="camera" size={24} className="text-slate-400" />
            <Text className="">Ta et bilde</Text>
          </TouchableOpacity>
        )}

        {/* Shows any validation errors */}
        {children}
        <FieldErrors meta={meta} />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    zIndex: 11,
  },
});
