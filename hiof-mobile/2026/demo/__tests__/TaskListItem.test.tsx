// Component test of one row. Renders against the real react-native through
// vitest-expo, so accessibility roles and labels behave as on device.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, userEvent } from "@testing-library/react-native";
import { TaskListItem } from "@/components/tasks/TaskListItem";
import type { Task } from "@/types";

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

const handlers = {
  onMoveUp: vi.fn(),
  onMoveDown: vi.fn(),
  onToggle: vi.fn(),
};

// RNTL 14's render is async, so every call has to be awaited.
async function renderRow(
  overrides: Partial<Task> = {},
  flags = { isFirst: false, isLast: false },
) {
  return render(
    <TaskListItem task={{ ...task, ...overrides }} {...flags} {...handlers} />,
  );
}

beforeEach(() => {
  handlers.onMoveUp.mockReset();
  handlers.onMoveDown.mockReset();
  handlers.onToggle.mockReset();
});

describe("TaskListItem rendering", () => {
  it("shows the name and the formatted due date", async () => {
    await renderRow();

    expect(screen.getByText("Skrive rapport")).toBeOnTheScreen();
    expect(screen.getByText("24. desember 2026")).toBeOnTheScreen();
  });

  it("exposes the checkbox state to assistive tech", async () => {
    await renderRow({ completed: true });

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeOnTheScreen();
    expect(checkbox.props.accessibilityState.checked).toBe(true);
  });

  it("names the move buttons after the task, not just up and down", async () => {
    // A screen reader user hears which task moves, which a bare arrow glyph
    // would not tell them.
    await renderRow();

    expect(screen.getByLabelText("Flytt Skrive rapport opp")).toBeOnTheScreen();
    expect(screen.getByLabelText("Flytt Skrive rapport ned")).toBeOnTheScreen();
  });
});

describe("TaskListItem interaction", () => {
  it("calls onToggle when the checkbox is pressed", async () => {
    const user = userEvent.setup();
    await renderRow();

    await user.press(screen.getByRole("checkbox"));

    expect(handlers.onToggle).toHaveBeenCalledTimes(1);
  });

  it("calls onMoveDown when the down button is pressed", async () => {
    const user = userEvent.setup();
    await renderRow();

    await user.press(screen.getByLabelText("Flytt Skrive rapport ned"));

    expect(handlers.onMoveDown).toHaveBeenCalledTimes(1);
    expect(handlers.onMoveUp).not.toHaveBeenCalled();
  });

  it("disables up on the first row and down on the last", async () => {
    const user = userEvent.setup();
    await renderRow({}, { isFirst: true, isLast: false });

    await user.press(screen.getByLabelText("Flytt Skrive rapport opp"));

    expect(handlers.onMoveUp).not.toHaveBeenCalled();
  });
});
