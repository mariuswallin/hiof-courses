import { Drawer } from "expo-router/drawer";
import { Redirect } from "expo-router";
import { useAuth } from "@/context/AuthProvider";
import { Loading } from "@/components/shared/Loading";
import { Theme } from "@/constants/theme";

/**
 * Drawer around the signed in part of the app, and the guard that keeps
 * everything under (app) behind a session.
 *
 * From SDK 56 the drawer ships with expo-router itself, built on
 * react-native-drawer-layout. @react-navigation/drawer is not needed.
 */
export default function AppLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <Loading />;
  if (!user) return <Redirect href="/login" />;

  return (
    <Drawer
      screenOptions={{
        drawerActiveTintColor: Theme.primary,
        headerTintColor: Theme.primary,
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{ drawerLabel: "Oppgaver", title: "Oppgaver" }}
      />
      <Drawer.Screen
        name="tasks"
        options={{ drawerItemStyle: { display: "none" }, title: "Oppgave" }}
      />
    </Drawer>
  );
}
