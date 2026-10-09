// Edit screen.
//
// Loads the task, then hands it to TaskForm as a prop. Create and edit share
// that component so the fields and validation cannot drift apart.
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView } from "react-native";
import { useTask, useUpdateTask } from "@/hooks/useTasks";
import { QueryWrapper } from "@/components/shared/QueryWrapper";
import { TaskForm } from "@/components/tasks/TaskForm";

export default function TaskEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useTask(id);
  const update = useUpdateTask();
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-white">
      <QueryWrapper query={query}>
        {(task) => (
          <TaskForm
            task={task}
            submitLabel="Lagre"
            isSubmitting={update.isPending}
            error={update.error instanceof Error ? update.error.message : null}
            onSubmit={(input) =>
              update.mutate(
                { id: task.id, patch: input },
                { onSuccess: () => router.back() },
              )
            }
          />
        )}
      </QueryWrapper>
    </ScrollView>
  );
}
