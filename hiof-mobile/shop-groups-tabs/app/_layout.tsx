import { Stack, useRouter } from "expo-router";
import { Pressable, Text } from "react-native";

import { Image } from "react-native";
import LogoImage from "../assets/icon.png";

function Logo() {
  return <Image style={{ width: 50, height: 50 }} source={LogoImage} />;
}

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#002266",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          // Custom title component, to show the logo
          headerTitle: () => <Logo />,
          title: "Shop",
          // Adds a button to the header. This screen only.
          headerRight: () => (
            <Pressable
              onPress={() => alert("Dette er en handling!")}
              style={{
                backgroundColor: "#002266",
                padding: 10,
                borderRadius: 5,
                marginRight: 10,
              }}
            >
              <Text style={{ color: "#fff" }}>Handling</Text>
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="about"
        options={{
          title: "Om appen",
        }}
      />
      <Stack.Screen name="(admin)" />
      <Stack.Screen name="(public)" options={{ headerTitle: "" }} />
    </Stack>
  );
}
