// Spinner with a label. Used by QueryWrapper while a query is pending.
import { ActivityIndicator, Text, View } from "react-native";
import { Theme } from "@/constants/theme";

export function Loading({ label = "Laster" }: { label?: string }) {
  return (
    <View className="flex-1 items-center justify-center gap-3 p-6">
      <ActivityIndicator size="large" color={Theme.primary} />
      <Text className="text-muted">{label}</Text>
    </View>
  );
}
