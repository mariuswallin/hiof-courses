// Profile, second tab.
//
// Reads the user from AuthProvider and counts tasks from the same query the
// list screen uses. React Query serves both from one cache entry, so this does
// not cause a second request.
import { Pressable, Text, View } from "react-native";
import { useAuth } from "@/context/AuthProvider";
import { useTasks } from "@/hooks/useTasks";
import { MockBadge } from "@/components/shared/MockBadge";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { data: tasks } = useTasks();

  const done = tasks?.filter((task) => task.completed).length ?? 0;

  return (
    <View className="flex-1 bg-white">
      <MockBadge />
      <View className="gap-4 p-6">
        <View>
          <Text className="text-2xl font-bold">{user?.name}</Text>
          <Text className="text-muted">{user?.email}</Text>
        </View>

        <View className="rounded-lg border border-gray-300 p-4">
          <Text className="text-muted">Oppgaver</Text>
          <Text className="text-xl font-semibold">
            {done} av {tasks?.length ?? 0} fullført
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={logout}
          className="self-start rounded-md border border-danger px-4 py-2"
        >
          <Text className="font-semibold text-danger">Logg ut</Text>
        </Pressable>
      </View>
    </View>
  );
}
