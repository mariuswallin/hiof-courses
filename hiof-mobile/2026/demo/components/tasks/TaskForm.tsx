import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useForm } from "@tanstack/react-form";
import { TaskFormSchema, type Task, type TaskInput } from "@/types";
import { TaskCamera } from "./TaskCamera";
import { formatDate } from "@/utils/date";

type Props = {
  task?: Task;
  submitLabel: string;
  isSubmitting?: boolean;
  error?: string | null;
  onSubmit: (input: TaskInput) => void;
};

/**
 * Create and edit share one form.
 *
 * TanStack Form owns the field state, and Zod owns what is valid. The schema
 * is the same one the provider validates against, so the rules cannot drift
 * between client and server.
 */
export function TaskForm({
  task,
  submitLabel,
  isSubmitting,
  error,
  onSubmit,
}: Props) {
  // The photo is not a text field, so it sits outside the form and is merged
  // back in on submit.
  const [imageId, setImageId] = useState<string | null>(task?.imageId ?? null);

  const form = useForm({
    defaultValues: {
      name: task?.name ?? "",
      description: task?.description ?? "",
      dueDate: task?.dueDate ?? new Date(Date.now() + 24 * 60 * 60 * 1000),
      completed: task?.completed ?? false,
    },
    validators: {
      // Only the fields the form owns. imageId is merged in on submit.
      onChange: TaskFormSchema,
    },
    onSubmit: ({ value }) => onSubmit({ ...value, imageId }),
  });

  return (
    <View className="gap-4 p-4">
      <form.Field name="name">
        {(field) => (
          <View className="gap-1">
            <Text className="font-semibold">Navn</Text>
            <TextInput
              accessibilityLabel="Navn"
              value={field.state.value}
              onChangeText={field.handleChange}
              onBlur={field.handleBlur}
              placeholder="Hva skal gjøres?"
              className="rounded-md border border-gray-300 px-3 py-2"
            />
            {field.state.meta.errors.length > 0 && (
              <Text accessibilityRole="alert" className="text-sm text-danger">
                {String(field.state.meta.errors[0]?.message ?? "")}
              </Text>
            )}
          </View>
        )}
      </form.Field>

      <form.Field name="description">
        {(field) => (
          <View className="gap-1">
            <Text className="font-semibold">Beskrivelse</Text>
            <TextInput
              accessibilityLabel="Beskrivelse"
              value={field.state.value}
              onChangeText={field.handleChange}
              multiline
              numberOfLines={3}
              placeholder="Valgfritt"
              className="rounded-md border border-gray-300 px-3 py-2"
            />
            {/* Tip worth knowing: the microphone key on the system keyboard
                dictates straight into any TextInput, with no extra package. */}
            <Text className="text-xs text-muted">
              Tips: bruk mikrofonknappen på tastaturet for å diktere.
            </Text>
          </View>
        )}
      </form.Field>

      <form.Field name="dueDate">
        {(field) => (
          <View className="gap-1">
            <Text className="font-semibold">Frist</Text>
            <Text className="text-muted">{formatDate(field.state.value)}</Text>
          </View>
        )}
      </form.Field>

      <View className="gap-2">
        <Text className="font-semibold">Bilde</Text>
        <TaskCamera imageId={imageId} onChange={setImageId} />
      </View>

      {error && (
        <Text accessibilityRole="alert" className="text-danger">
          {error}
        </Text>
      )}

      <form.Subscribe selector={(state) => state.canSubmit}>
        {(canSubmit) => (
          <Pressable
            accessibilityRole="button"
            disabled={!canSubmit || isSubmitting}
            onPress={() => form.handleSubmit()}
            className={`rounded-md px-4 py-3 ${
              canSubmit && !isSubmitting ? "bg-primary" : "bg-gray-300"
            }`}
          >
            <Text className="text-center font-semibold text-white">
              {isSubmitting ? "Lagrer" : submitLabel}
            </Text>
          </Pressable>
        )}
      </form.Subscribe>
    </View>
  );
}
