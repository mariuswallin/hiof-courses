// Create screen, shown as a modal.
//
// What makes it a modal is not this file but the route config in
// app/_layout.tsx, which sets presentation: "modal" on it. The screen itself
// is an ordinary component.
//
// It reuses TaskForm, the same component the edit screen uses. The only
// difference is which mutation runs on submit.
import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useCreateTask } from "@/hooks/useTasks";
import { TaskForm } from "@/components/tasks/TaskForm";

export default function NewTaskScreen() {
  const create = useCreateTask();
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-white">
      <TaskForm
        submitLabel="Opprett"
        isSubmitting={create.isPending}
        error={create.error instanceof Error ? create.error.message : null}
        onSubmit={(input) =>
          create.mutate(input, { onSuccess: () => router.back() })
        }
      />
    </ScrollView>
  );
}
