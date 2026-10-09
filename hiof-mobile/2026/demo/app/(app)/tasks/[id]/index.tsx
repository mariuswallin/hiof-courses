// Task detail screen.
//
// The [id] in the folder name makes this a dynamic route, and
// useLocalSearchParams reads that segment. Opening /tasks/42 gives id = "42".
import { Link, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useDeleteTask, useTask } from "@/hooks/useTasks";
import { QueryWrapper } from "@/components/shared/QueryWrapper";
import { backend } from "@/providers";
import { formatDate } from "@/utils/date";

export default function TaskDetailScreen() {
  // useLocalSearchParams reads the [id] segment from the route.
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useTask(id);
  const remove = useDeleteTask();
  const router = useRouter();

  return (
    <QueryWrapper query={query} loadingLabel="Henter oppgave">
      {(task) => {
        const imageUrl = backend.files.previewUrl(task.imageId);

        return (
          <ScrollView className="flex-1 bg-white" contentContainerClassName="gap-4 p-4">
            <Text className="text-2xl font-bold">{task.name}</Text>
            <Text className="text-muted">Frist: {formatDate(task.dueDate)}</Text>

            {task.description ? (
              <Text>{task.description}</Text>
            ) : (
              <Text className="text-muted">Ingen beskrivelse</Text>
            )}

            {imageUrl && (
              <Image
                source={{ uri: imageUrl }}
                style={{ width: "100%", height: 240, borderRadius: 8 }}
                contentFit="cover"
                accessibilityLabel={`Bilde for ${task.name}`}
              />
            )}

            <View className="flex-row gap-2">
              <Link href={`/tasks/${task.id}/edit`} asChild>
                <Pressable
                  accessibilityRole="button"
                  className="rounded-md bg-primary px-4 py-2"
                >
                  <Text className="font-semibold text-white">Rediger</Text>
                </Pressable>
              </Link>

              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  remove.mutate(task.id, { onSuccess: () => router.back() })
                }
                className="rounded-md border border-danger px-4 py-2"
              >
                <Text className="font-semibold text-danger">Slett</Text>
              </Pressable>
            </View>
          </ScrollView>
        );
      }}
    </QueryWrapper>
  );
}
