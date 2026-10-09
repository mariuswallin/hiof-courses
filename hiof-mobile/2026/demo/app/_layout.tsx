import "./global.css";
import "react-native-url-polyfill/auto";

import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { QueryProvider } from "@/context/QueryProvider";
import { AuthProvider } from "@/context/AuthProvider";

/**
 * Root layout. Everything else renders inside these providers.
 *
 * GestureHandlerRootView must wrap the whole app for the drawer to work.
 * The order matters: Query outside Auth, because AuthProvider does not use
 * queries but screens inside it use both.
 */
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryProvider>
          <AuthProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(app)" />
              <Stack.Screen name="login" />
              <Stack.Screen name="register" />
              {/* presentation: "modal" is what makes the screen slide up from
                  the bottom instead of pushing from the side. */}
              <Stack.Screen
                name="(modals)/new-task"
                options={{
                  presentation: "modal",
                  headerShown: true,
                  title: "Ny oppgave",
                }}
              />
            </Stack>
          </AuthProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
