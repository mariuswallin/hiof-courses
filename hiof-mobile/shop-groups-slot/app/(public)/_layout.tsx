import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "teal",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        //headerShown: false,
      }}
    >
      <Stack.Screen
        name="products/index"
        options={{
          title: "Alle produkter",
        }}
      />
      <Stack.Screen
        name="products/[id]"
        options={({ route }) => ({
          // Use the dynamic "id" in the title
          title: `Produkt ${(route?.params as { id?: string })?.id ?? ""}`,
          // Change the label on the back button
          headerBackTitle: "Alle produkter",
        })}
      />
    </Stack>
  );
}
