// @vitest-environment happy-dom
//
// Component test of the drag and drop list.
//
// Real pointer dragging needs layout and pointer events that happy-dom does
// not provide, so that is covered in the e2e test. What is worth testing here
// is the wiring: the rows render in order, every row has a reachable handle,
// and the action is called with the new id order.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

const reorderTasksAction = vi.fn();
vi.mock("@/features/tasks/actions/reorderTasksAction", () => ({
  reorderTasksAction: (...args: unknown[]) => reorderTasksAction(...args),
}));

// move() is driven by a real drag event we cannot produce here, so it is
// stubbed to return the list reversed. That is enough to prove the component
// saves whatever order move() hands back.
vi.mock("@dnd-kit/helpers", () => ({
  move: (items: { id: string }[]) => [...items].reverse(),
}));

// DragDropProvider is replaced by a plain wrapper that exposes onDragEnd on a
// button, so the test can trigger a drop without a pointer.
vi.mock("@dnd-kit/react", () => ({
  DragDropProvider: ({
    children,
    onDragEnd,
  }: {
    children: React.ReactNode;
    onDragEnd: (event: unknown) => void;
  }) => (
    <div>
      <button type="button" onClick={() => onDragEnd({})}>
        drop
      </button>
      {children}
    </div>
  ),
}));

vi.mock("@dnd-kit/react/sortable", () => ({
  useSortable: () => ({
    ref: () => {},
    handleRef: () => {},
    isDragging: false,
  }),
}));

import TaskSortableList from "../TaskSortableList";
import type { Task } from "@/db/schema";

function makeTask(id: string, name: string, order: number): Task {
  return {
    id,
    name,
    description: `Description ${name}`,
    dueDate: new Date("2026-01-01T12:00:00Z"),
    userId: 1,
    completed: false,
    published: true,
    order,
  };
}

const tasks = [makeTask("t1", "First", 0), makeTask("t2", "Second", 1)];

const ids = () =>
  screen
    .getAllByTestId("task-row")
    .map((row) => row.getAttribute("data-task-id"));

beforeEach(() => {
  reorderTasksAction.mockReset();
  reorderTasksAction.mockResolvedValue({ success: true, data: [] });
});

describe("TaskSortableList rendering", () => {
  it("renders the tasks in the order it was given", () => {
    render(<TaskSortableList tasks={tasks} />);

    expect(ids()).toEqual(["t1", "t2"]);
  });

  it("gives every row a handle with an accessible name", () => {
    render(<TaskSortableList tasks={tasks} />);

    expect(
      screen.getByRole("button", { name: "Reorder First" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reorder Second" })
    ).toBeInTheDocument();
  });
});

describe("TaskSortableList reordering", () => {
  it("saves the new id order when a drag ends", async () => {
    render(<TaskSortableList tasks={tasks} />);

    screen.getByRole("button", { name: "drop" }).click();

    await waitFor(() =>
      expect(reorderTasksAction).toHaveBeenCalledWith(["t2", "t1"])
    );
    expect(ids()).toEqual(["t2", "t1"]);
  });

  it("rolls the list back and shows the error when saving fails", async () => {
    reorderTasksAction.mockResolvedValue({
      success: false,
      error: { message: "One or more tasks were not found", code: 404 },
    });
    render(<TaskSortableList tasks={tasks} />);

    screen.getByRole("button", { name: "drop" }).click();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "One or more tasks were not found"
    );
    // Back to the order the server still has.
    expect(ids()).toEqual(["t1", "t2"]);
  });
});
