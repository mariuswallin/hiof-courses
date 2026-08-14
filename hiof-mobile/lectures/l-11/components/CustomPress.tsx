import type React from "react";
import {
  Pressable,
  type PressableProps,
  StyleSheet,
  Platform,
} from "react-native";

// Props type for our component, extending Pressable's props
type PressProps = PressableProps & {
  children: React.ReactNode;
  // Whether the component shows visual feedback on press
  feedbackStyle?: boolean;
  // Whether to use the Android ripple effect
  useRipple?: boolean;
  // Whether to expand the tappable area
  hitSlop?:
    | number
    | {
        top?: number;
        bottom?: number;
        left?: number;
        right?: number;
      };
};

export default function CustomPress({
  children,
  feedbackStyle = true,
  useRipple = true,
  hitSlop,
  style,
  android_ripple,
  ...rest
}: PressProps) {
  // Set up the default Android ripple when useRipple is true
  const rippleConfig =
    useRipple && Platform.OS === "android"
      ? android_ripple || { color: "#00000020", borderless: false }
      : undefined;

  return (
    <Pressable
      {...rest}
      hitSlop={hitSlop}
      android_ripple={rippleConfig}
      style={({ pressed }) => [
        // Base style
        styles.pressable,
        // Caller-defined style (can be a function or an object)
        typeof style === "function" ? style({ pressed }) : style,
        // Add the feedback style when enabled and pressed
        feedbackStyle && pressed && styles.pressed,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    // No default style; the caller defines the base style
  },
  pressed: {
    opacity: 0.8,
    backgroundColor: "#00000010",
  },
});
