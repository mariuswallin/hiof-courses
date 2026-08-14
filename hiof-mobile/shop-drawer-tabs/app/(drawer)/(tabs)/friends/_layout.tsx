import { DrawerToggleButton } from "expo-router/drawer";
import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerLeft: () => <DrawerToggleButton />,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Friends" }} />
    </Stack>
  );
}
