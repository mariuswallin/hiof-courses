// app/(admin)/(students)/_layout.tsx

import { router, Tabs, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Theme } from "../../../constants/theme";
import { FloatingButton } from "../../../components/FloatingButton";

import { useFormContext } from "@/context/FormContextReducer";
import { Alert } from "react-native";

export default function StudentsGroupLayout() {
  // usePathname gives access to the current path
  const pathname = usePathname();
  // Strip the leading slash. That gives a cleaner path to compare against
  // earlier ones.
  const previousPath = pathname.replace(/\//, "");

  // useFormContext gives access to the form state and the dispatch function
  const { state, dispatch } = useFormContext();
  const isDirty = state.status === "dirty";

  // Decide whether to prevent the default behaviour
  const shouldPreventDefault = (targetPath?: string) => {
    if (!targetPath) return false;
    return isDirty && targetPath !== previousPath && previousPath === "add";
  };

  // Warn the user when they try to navigate away from the screen
  const triggerAlert = (targetPath: string) => {
    Alert.alert(
      "Unsaved changes",
      "You have unsaved changes. Are you sure you want to leave?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Ok",
          onPress: () => {
            // Reset the form
            dispatch({ type: "RESET_FORM" });
            // Navigate to the new path with router.navigate
            router.navigate(targetPath);
          },
        },
      ],
      { cancelable: false } // Prevents closing by tapping outside it
    );
  };

  return (
    <Tabs
      screenListeners={{
        // Fires when navigating away from a screen (back)
        beforeRemove: (e) => {
          const targetPath = e.target?.split("-")[0];
          if (shouldPreventDefault(targetPath)) {
            // Cancel the navigation
            e.preventDefault();
            triggerAlert(targetPath as string);
          }
        },
        // Fires on tab change
        tabPress: (e) => {
          const targetPath = e.target?.split("-")[0];
          if (shouldPreventDefault(targetPath)) {
            // Cancel the navigation
            e.preventDefault();
            triggerAlert(targetPath as string);
          }
        },
      }}
      screenOptions={{
        headerStyle: {
          backgroundColor: Theme.primary,
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="list"
        options={{
          title: "Students",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "",
          headerTitle: "Legg til student",
          headerShown: true,
          tabBarIcon: ({ focused }) => {
            const iconColor = focused ? Theme.primary : Theme.background;
            const buttonColor = focused ? Theme.background : Theme.primary;
            return (
              <FloatingButton color={buttonColor} size={60}>
                <Ionicons name="add-circle" size={60} color={iconColor} />
              </FloatingButton>
            );
          },
        }}
      />
    </Tabs>
  );
}
