// Tests the hooks against the in-memory backend. No network, no Appwrite.
import { describe, it, expect, beforeEach } from "vitest";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, userEvent, waitFor } from "@testing-library/react-native";
import { Pressable, Text } from "react-native";
import { resetMock } from "@/providers/mock";
import { AuthProvider } from "@/context/AuthProvider";
import { useTasks, useCreateTask, useReorderTasks } from "@/hooks/useTasks";

// Every test renders inside the same providers the app uses. That way the
// hooks are exercised through React Query and AuthProvider, not called
// directly, which is closer to how they actually run.
function wrapper({ children }: { children: ReactNode }) {
  // retry false so a failing query fails immediately instead of after backoff.
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={client}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}

function Liste() {
  const { data, isPending } = useTasks();
  if (isPending) return <Text>Laster</Text>;
  return (
    <>
      {data?.map((task) => (
        <Text key={task.id} testID="rad">
          {task.name}
        </Text>
      ))}
    </>
  );
}

beforeEach(() => resetMock());

describe("useTasks", () => {
  it("loads the signed in user's tasks", async () => {
    render(<Liste />, { wrapper });

    await waitFor(() =>
      expect(screen.getByText("Lese kapittel om navigasjon")).toBeOnTheScreen(),
    );
    expect(screen.getAllByTestId("rad")).toHaveLength(3);
  });
});

describe("useCreateTask", () => {
  function Oppretter() {
    const { data } = useTasks();
    const create = useCreateTask();
    return (
      <>
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            create.mutate({
              name: "Helt ny oppgave",
              description: "",
              dueDate: new Date("2026-06-01"),
              completed: false,
              imageId: null,
            })
          }
        >
          <Text>Opprett</Text>
        </Pressable>
        <Text testID="antall">{data?.length ?? 0}</Text>
      </>
    );
  }

  it("adds a task and refreshes the list", async () => {
    const user = userEvent.setup();
    render(<Oppretter />, { wrapper });
    await waitFor(() => expect(screen.getByTestId("antall")).toHaveTextContent("3"));

    await user.press(screen.getByRole("button", { name: "Opprett" }));

    await waitFor(() => expect(screen.getByTestId("antall")).toHaveTextContent("4"));
  });
});

describe("useReorderTasks", () => {
  function Sorterer() {
    const { data } = useTasks();
    const reorder = useReorderTasks();
    return (
      <>
        <Pressable
          accessibilityRole="button"
          onPress={() => reorder.mutate(["3", "1", "2"])}
        >
          <Text>Sorter</Text>
        </Pressable>
        <Text testID="rekkefolge">{data?.map((t) => t.id).join(",") ?? ""}</Text>
      </>
    );
  }

  it("writes the new order and reflects it in the list", async () => {
    const user = userEvent.setup();
    render(<Sorterer />, { wrapper });
    await waitFor(() =>
      expect(screen.getByTestId("rekkefolge")).toHaveTextContent("1,2,3"),
    );

    await user.press(screen.getByRole("button", { name: "Sorter" }));

    await waitFor(() =>
      expect(screen.getByTestId("rekkefolge")).toHaveTextContent("3,1,2"),
    );
  });
});
