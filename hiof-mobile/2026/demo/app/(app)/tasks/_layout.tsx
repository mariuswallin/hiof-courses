import { Stack } from "expo-router";

/**
 * Stack for the task detail routes.
 *
 * Without a layout here, expo-router hoists `tasks/[id]/index` and
 * `tasks/[id]/edit` up to the nearest parent layout, which is the Drawer. The
 * `<Drawer.Screen name="tasks">` entry would then match nothing, and both
 * routes would show up as drawer items instead of being hidden.
 *
 * Every nested folder in lecture l-30 has its own _layout.tsx for the same
 * reason.
 */
export default function TasksLayout() {
  return (
    <Stack>
      <Stack.Screen name="[id]/index" options={{ title: "Oppgave" }} />
      <Stack.Screen name="[id]/edit" options={{ title: "Rediger" }} />
    </Stack>
  );
}
