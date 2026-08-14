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
      <Stack.Screen
        name="profile"
        options={{
          headerShown: false,
          presentation: "formSheet",
          animation: "slide_from_bottom",
          sheetGrabberVisible: true,
        }}
      />
      <Stack.Screen
        name="user-profile"
        options={{
          headerBackVisible: true,
          headerBackButtonDisplayMode: "minimal",
          headerTitle: "Brukerprofil",
          headerTitleAlign: "center",
          headerBackTitle: "Tilbake",
        }}
      />
    </Stack>
  );
}
