import { View } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Theme } from "../constants/theme";
import type { PropsWithChildren } from "react";

type CustomViewProps = Partial<React.AbstractView> & {
  style?: object;
  safeArea?: boolean;
};

export default function CustomView({
  style,
  safeArea = false,
  ...props
}: PropsWithChildren<CustomViewProps>) {
  // Read the safe area insets. This padding goes on the top and bottom of the
  // component, so content is not hidden behind the status bar or home indicator.
  const insets = useSafeAreaInsets();

  // Used in components where we do not want the safe area
  if (!safeArea)
    return (
      <View style={[{ backgroundColor: Theme.background }, style]} {...props} />
    );

  return (
    <View
      style={[
        {
          backgroundColor: Theme.background, // Farge på bakgrunnen
          paddingTop: insets.top, // Gir padding til toppen basert på status bar
          paddingBottom: insets.bottom, // Gir padding til bunnen basert på home indicator
        },
        style,
      ]}
      {...props}
    />
  );
}
