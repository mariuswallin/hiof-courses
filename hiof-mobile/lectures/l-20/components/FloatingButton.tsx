// components/FloatingButton.tsx

// PropsWithChildren is a generic type that gives us the children prop
import React, { type PropsWithChildren } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";

// Import a custom press-handling component
import CustomPress from "./CustomPress";
import { Theme } from "../constants/theme";

type FloatingButtonProps = {
  onPress?: () => void; // Function to run when the button is pressed (optional)
  size?: number; // Button size in pixels (optional)
  color?: string; // Button background color (optional)
  style?: ViewStyle; // Extra styles for the button (optional)
};

export function FloatingButton({
  onPress,
  size = 60, // Standardstørrelse hvis ikke spesifisert
  color = "#D41A1A", // Standardfarge hvis ikke spesifisert
  children, // Innholdet som skal vises i knappen (f.eks. et ikon)
  style, // Ekstra stiler
}: PropsWithChildren<FloatingButtonProps>) {
  // Press helper — checks whether an onPress function exists
  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  // With no onPress, render a static button without press behaviour
  if (!onPress) {
    return (
      <View style={styles.container}>
        <View
          style={[
            styles.button,
            {
              width: size, // Dynamisk størrelse basert på props
              height: size, // Samme høyde som bredde for en perfekt sirkel
              borderRadius: size / 2, // Halvparten av størrelsen for å lage en sirkel
              backgroundColor: color, // Dynamisk farge basert på props
            },
            ...(style ? [style] : []), // Legger til ekstra stiler hvis de finnes
          ]}
        >
          {children}
        </View>
      </View>
    );
  }

  // With an onPress, use CustomPress
  return (
    <View style={styles.container}>
      <CustomPress
        onPress={handlePress}
        style={[
          styles.button,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
          ...(style ? [style] : []),
        ]}
        feedbackStyle={true} // Enables visual feedback on press
        useRipple={true} // Enables the ripple effect on press
      >
        {children}
      </CustomPress>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute", // Absolutt posisjonering så knappen kan "flyte" over annet innhold
    bottom: 0, // Plasserer knappen nederst
    right: 0, // Plasserer knappen til høyre
    zIndex: 999, // Høy zIndex sikrer at knappen vises over andre elementer
    borderColor: Theme.gray, // Border-farge fra tema
    borderWidth: 8, // Tykkelse på border
    borderRadius: 999, // Høy verdi for å sikre rund form uansett størrelse
  },
  button: {
    justifyContent: "center", // Sentrerer innholdet vertikalt
    alignItems: "center", // Sentrerer innholdet horisontalt
    elevation: 5, // Android-spesifikk skygge
    shadowColor: "#000", // iOS-skygge egenskaper
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});
