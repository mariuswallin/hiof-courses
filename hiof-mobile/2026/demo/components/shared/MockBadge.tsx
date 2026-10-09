import { Text, View } from "react-native";
import { isMockBackend } from "@/providers";

/**
 * Shown when the app runs without Appwrite configured. Without it, demo data
 * looks like real data, which is confusing the first time you run the app.
 */
export function MockBadge() {
  if (!isMockBackend) return null;

  return (
    <View className="bg-contrast px-4 py-1">
      <Text className="text-center text-xs font-semibold text-black">
        Demodata. Sett opp .env for å bruke Appwrite, se APPWRITE.md
      </Text>
    </View>
  );
}
