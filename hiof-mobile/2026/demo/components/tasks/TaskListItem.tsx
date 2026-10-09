import { Pressable, Text, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import { Link } from "expo-router";
import { formatDate, isOverdue } from "@/utils/date";
import { cn } from "@/utils/cn";
import type { Task } from "@/types";

type Props = {
  task: Task;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggle: () => void;
};

/**
 * One row in the task list.
 *
 * Animated.View with `layout={LinearTransition}` is what animates the move
 * when the row changes position: React re-renders the list in the new order,
 * and Reanimated slides the row from where it was to where it now is. Same
 * API the lectures use in components/shared/PictureView.tsx.
 */
export function TaskListItem({
  task,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onToggle,
}: Props) {
  const overdue = !task.completed && isOverdue(task.dueDate);

  return (
    <Animated.View
      layout={LinearTransition}
      entering={FadeIn}
      exiting={FadeOut}
      className="mb-2 flex-row items-center gap-2 rounded-lg border border-gray-300 bg-white p-3"
    >
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: task.completed }}
        accessibilityLabel={`Merk ${task.name} som ${task.completed ? "ikke fullført" : "fullført"}`}
        onPress={onToggle}
        className="h-6 w-6 items-center justify-center rounded border border-gray-400"
      >
        {task.completed && <Text>✓</Text>}
      </Pressable>

      <Link href={`/tasks/${task.id}`} asChild>
        <Pressable accessibilityRole="link" className="flex-1">
          <Text
            className={cn(
              "font-semibold",
              task.completed && "text-muted line-through",
            )}
          >
            {task.name}
          </Text>
          <Text
            className={cn("text-xs", overdue ? "text-danger" : "text-muted")}
          >
            {formatDate(task.dueDate)}
          </Text>
        </Pressable>
      </Link>

      {/* Buttons rather than drag: the lectures only cover Reanimated's
          declarative layout props, not the gesture worklets. Buttons also work
          with a screen reader, which dragging does not. */}
      <View className="flex-row">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Flytt ${task.name} opp`}
          disabled={isFirst}
          onPress={onMoveUp}
          className={cn("px-2 py-1", isFirst && "opacity-30")}
        >
          <Text className="text-lg">↑</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Flytt ${task.name} ned`}
          disabled={isLast}
          onPress={onMoveDown}
          className={cn("px-2 py-1", isLast && "opacity-30")}
        >
          <Text className="text-lg">↓</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}
