// app/(zShared)/_layout.tsx

import { Theme } from "@/constants/theme";
import { Stack } from "expo-router";

export default function SharedLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Theme.primary,
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      {/* Defines a screen for access */}
      {/* Uses fullScreenModal as the presentation, so */}
      {/* it covers the whole screen */}
      <Stack.Screen
        name="access"
        options={{
          presentation: "fullScreenModal",
          headerShown: false,
          animation: "fade",
        }}
      />
    </Stack>
  );
}
