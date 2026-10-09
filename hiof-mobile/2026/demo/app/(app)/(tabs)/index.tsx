// The task list, first tab.
//
// QueryWrapper renders the loading and error states so this file only has to
// describe the success case.
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTasks } from "@/hooks/useTasks";
import { QueryWrapper } from "@/components/shared/QueryWrapper";
import { MockBadge } from "@/components/shared/MockBadge";
import { TaskList } from "@/components/tasks/TaskList";

export default function TaskListScreen() {
  const query = useTasks();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white">
      <MockBadge />
      <QueryWrapper query={query} loadingLabel="Henter oppgaver">
        {(tasks) => <TaskList tasks={tasks} />}
      </QueryWrapper>

      {/* Floating button that opens the create screen as a modal. */}
      <Link href="/(modals)/new-task" asChild>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ny oppgave"
          style={{ bottom: insets.bottom + 16 }}
          className="absolute right-6 h-14 w-14 items-center justify-center rounded-full bg-primary"
        >
          <Text className="text-3xl leading-9 text-white">+</Text>
        </Pressable>
      </Link>
    </View>
  );
}
