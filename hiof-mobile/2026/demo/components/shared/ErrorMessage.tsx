import { Pressable, Text, View } from "react-native";

export function ErrorMessage({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    // accessibilityRole="alert" so a screen reader announces the failure
    // instead of leaving the user on a silent empty screen.
    <View accessibilityRole="alert" className="gap-3 p-6">
      <Text className="text-danger font-semibold">Noe gikk galt</Text>
      <Text className="text-muted">{message}</Text>
      {onRetry && (
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          className="self-start rounded-md bg-primary px-4 py-2"
        >
          <Text className="font-semibold text-white">Prøv igjen</Text>
        </Pressable>
      )}
    </View>
  );
}
