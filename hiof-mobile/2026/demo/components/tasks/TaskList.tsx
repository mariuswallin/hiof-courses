import { useState } from "react";
import { ScrollView, Switch, Text, View } from "react-native";
import { useReorderTasks, useUpdateTask } from "@/hooks/useTasks";
import { Empty } from "@/components/shared/Empty";
import { TaskListItem } from "./TaskListItem";
import type { Task } from "@/types";

/**
 * Moves the item at `from` to `to` and returns a new array.
 *
 * A new array, not a mutated one, because React only re-renders when the
 * reference changes.
 */
function move(tasks: Task[], from: number, to: number): Task[] {
  const next = [...tasks];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function TaskList({ tasks }: { tasks: Task[] }) {
  const [showCompleted, setShowCompleted] = useState(true);
  const reorder = useReorderTasks();
  const update = useUpdateTask();

  const visible = showCompleted ? tasks : tasks.filter((task) => !task.completed);

  // Reordering always sends the full list, not just the visible one, so
  // hiding completed tasks cannot silently drop them from the order.
  const moveBy = (id: string, delta: number) => {
    const from = tasks.findIndex((task) => task.id === id);
    const to = from + delta;
    if (from === -1 || to < 0 || to >= tasks.length) return;
    reorder.mutate(move(tasks, from, to).map((task) => task.id));
  };

  return (
    <View className="flex-1">
      <View className="flex-row items-center justify-between px-4 py-2">
        <Text className="text-muted">Vis fullførte</Text>
        <Switch
          accessibilityLabel="Vis fullførte oppgaver"
          value={showCompleted}
          onValueChange={setShowCompleted}
        />
      </View>

      {/* A ScrollView with map(), not a FlatList. FlatList recycles rows as
          you scroll, which fights the layout animation on reorder. Lesson 9
          says to switch to FlatList once a list can grow long, so that is the
          change to make if this app gets real data. */}
      {visible.length === 0 ? (
        <Empty
          title="Ingen oppgaver"
          hint={
            tasks.length === 0
              ? "Trykk på knappen nede til høyre for å lage din første."
              : "Alle oppgavene er fullført. Skru på bryteren for å se dem."
          }
        />
      ) : (
        <ScrollView className="px-4" contentContainerClassName="pb-24">
          {visible.map((task, index) => (
            <TaskListItem
              key={task.id}
              task={task}
              isFirst={index === 0}
              isLast={index === visible.length - 1}
              onMoveUp={() => moveBy(task.id, -1)}
              onMoveDown={() => moveBy(task.id, 1)}
              onToggle={() =>
                update.mutate({ id: task.id, patch: { completed: !task.completed } })
              }
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
