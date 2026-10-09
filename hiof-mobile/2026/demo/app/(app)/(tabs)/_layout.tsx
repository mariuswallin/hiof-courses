import { Tabs } from "expo-router";
import { Text } from "react-native";
import { Theme } from "@/constants/theme";

// Tabs inside the drawer: the drawer holds app level navigation, the tabs
// switch between the two main screens.
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Theme.primary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Oppgaver",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>☰</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>◍</Text>,
        }}
      />
    </Tabs>
  );
}
