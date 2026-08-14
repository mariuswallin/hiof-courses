import { Button, Text, View } from "react-native";
import { router } from "expo-router";
import { renderRouter, screen } from "expo-router/testing-library";
import { userEvent, waitFor } from "@testing-library/react-native";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Two simple components for navigation testing.
// SDK 56: expo-router is no longer compatible with @react-navigation/*.
// We test navigation with expo-router's in-memory router (renderRouter).
function ProfileScreen() {
  return (
    <View>
      <Text>Profilside</Text>
    </View>
  );
}

function Home() {
  return (
    <View>
      <Text>Hjemmeside</Text>
      <Button title="Gå til profil" onPress={() => router.push("/profile")} />
    </View>
  );
}

test("navigates to profile screen when profile button is pressed", async () => {
  await renderRouter(
    {
      index: Home,
      profile: ProfileScreen,
    },
    { initialUrl: "/" }
  );

  expect(screen.getByText("Hjemmeside")).toBeOnTheScreen();

  await userEvent.press(screen.getByText("Gå til profil"));

  await waitFor(() => {
    expect(screen.getByText("Profilside")).toBeOnTheScreen();
  });

  expect(screen.getByText("Profilside")).toBeOnTheScreen();
});
