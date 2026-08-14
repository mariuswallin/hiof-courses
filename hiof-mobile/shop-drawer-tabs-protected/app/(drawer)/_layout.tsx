import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router/build/exports";
import {
  Drawer,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "expo-router/drawer";

export default function Layout() {
  const router = useRouter();
  return (
    <Drawer
      screenOptions={{
        headerLeftContainerStyle: { paddingLeft: 16, paddingBottom: 6 },
      }}
      drawerContent={(props) => (
        <DrawerContentScrollView {...props}>
          <DrawerItemList {...props} />
          <DrawerItem label="Main" onPress={() => router.push("/main")} />
          <DrawerItem
            label="Settings"
            onPress={() => router.push("/settings")}
          />
        </DrawerContentScrollView>
      )}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{ headerShown: false, title: "Home" }}
      />
      <Drawer.Screen
        name="about"
        options={{
          headerShown: true,
          title: "About",
        }}
      />
    </Drawer>
  );
}
