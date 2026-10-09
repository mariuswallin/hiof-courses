// Shown when a list has nothing in it. The hint tells the user what to do
// next, which an empty screen on its own does not.
import { Text, View } from "react-native";

export function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <View className="flex-1 items-center justify-center gap-2 p-8">
      <Text className="text-lg font-semibold">{title}</Text>
      {hint && <Text className="text-center text-muted">{hint}</Text>}
    </View>
  );
}
