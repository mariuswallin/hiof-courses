// app/_layout.tsx — rammen rundt alle skjermer.
// CSS-fila MÅ importeres her for at NativeWind skal virke.
import "./global.css";

import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { Theme } from "@/constants/theme";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Theme.primary },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Studenten" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
