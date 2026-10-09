// Component test of the form: validation from Zod, and what reaches onSubmit.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, userEvent, waitFor } from "@testing-library/react-native";
import { TaskForm } from "@/components/tasks/TaskForm";
import type { Task } from "@/types";

// The camera needs a device, so it is stubbed. What matters here is the form.
vi.mock("@/components/tasks/TaskCamera", () => ({
  TaskCamera: () => null,
}));

const task: Task = {
  id: "t1",
  name: "Skrive rapport",
  description: "En beskrivelse",
  dueDate: new Date("2026-12-24T10:00:00Z"),
  completed: false,
  order: 0,
  imageId: null,
  userId: "u1",
};

const onSubmit = vi.fn();

beforeEach(() => onSubmit.mockReset());

describe("TaskForm", () => {
  it("prefills the fields when editing an existing task", async () => {
    await render(<TaskForm task={task} submitLabel="Lagre" onSubmit={onSubmit} />);

    expect(screen.getByLabelText("Navn").props.value).toBe("Skrive rapport");
    expect(screen.getByLabelText("Beskrivelse").props.value).toBe("En beskrivelse");
  });

  it("starts empty when creating a new task", async () => {
    await render(<TaskForm submitLabel="Opprett" onSubmit={onSubmit} />);

    expect(screen.getByLabelText("Navn").props.value).toBe("");
  });

  it("submits the typed values", async () => {
    const user = userEvent.setup();
    await render(<TaskForm task={task} submitLabel="Lagre" onSubmit={onSubmit} />);

    await user.clear(screen.getByLabelText("Navn"));
    await user.type(screen.getByLabelText("Navn"), "Nytt navn");
    await user.press(screen.getByRole("button", { name: "Lagre" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0].name).toBe("Nytt navn");
  });

  it("blocks submit and shows the Zod message for a too short name", async () => {
    const user = userEvent.setup();
    await render(<TaskForm task={task} submitLabel="Lagre" onSubmit={onSubmit} />);

    await user.clear(screen.getByLabelText("Navn"));
    await user.type(screen.getByLabelText("Navn"), "ab");

    await waitFor(() =>
      expect(screen.getByText("Navnet må ha minst 3 tegn")).toBeOnTheScreen(),
    );

    await user.press(screen.getByRole("button", { name: "Lagre" }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("points at keyboard dictation instead of shipping a voice package", async () => {
    // The platform already does speech to text in any TextInput, so the app
    // does not need a recording library for it.
    await render(<TaskForm submitLabel="Opprett" onSubmit={onSubmit} />);

    expect(
      screen.getByText("Tips: bruk mikrofonknappen på tastaturet for å diktere."),
    ).toBeOnTheScreen();
  });
});
