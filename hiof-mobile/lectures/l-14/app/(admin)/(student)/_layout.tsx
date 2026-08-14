// app/(admin)/(student)/_layout.tsx

import { Slot, Stack } from "expo-router";

export default function StudentGroupLayout() {
  // The Stack does not need configuring, but a layout is required — without one
  // we get a navigation bar at the top of the screen
  return <Slot />;
  // Gives us a stack for these screens. It shows at the top, since we have no
  // configuration.
  return <Stack />;
  // Alternative, if we want a Stack plus configuration
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="students"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
