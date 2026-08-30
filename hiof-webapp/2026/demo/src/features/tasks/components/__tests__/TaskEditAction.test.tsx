// @vitest-environment happy-dom
//
// Component test of the form that uses a server action.
//
// Three things are demonstrated here:
//   1. render and assertions   the form is filled from data
//   2. actions and input       `userEvent` typing and clicking
//   3. timing                  `isPending` while the action is in flight
//
// The action itself is mocked. A component test should test the component,
// not the database. That the action really saves is covered in
// src/test/__tests__/tasks.action.test.ts and in the e2e test.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const editTaskAction = vi.fn();
vi.mock("@/features/tasks/actions/editTaskAction", () => ({
  editTaskAction: (...args: unknown[]) => editTaskAction(...args),
}));

import { AuthProvider } from "@/context/AuthContext";
import TaskEditAction from "../TaskEditAction";
import type { Task } from "@/db/schema";

const task: Task = {
  id: "t1",
  name: "Skriv ferdig oppgaven",
  description: "Beskrivelse",
  dueDate: new Date("2026-01-01T12:00:00Z"),
  userId: 1,
  completed: false,
  published: true,
  order: 0,
};

const user = { id: 1, name: "Kari", email: "kari@test.local", isAdmin: false };

function renderForm() {
  return render(
    <AuthProvider user={user}>
      <TaskEditAction task={task} />
    </AuthProvider>
  );
}

beforeEach(() => {
  editTaskAction.mockReset();
});

describe("TaskEditAction rendering", () => {
  it("fills the form with the name from the task", () => {
    renderForm();

    const input = screen.getByLabelText("Name:") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe("Skriv ferdig oppgaven");
  });

  it("includes the id as a hidden field", () => {
    const { container } = renderForm();

    const hidden = container.querySelector<HTMLInputElement>(
      'input[type="hidden"][name="id"]'
    );
    expect(hidden?.value).toBe("t1");
  });

  it("shows the signed in user from AuthContext", () => {
    renderForm();

    expect(screen.getByText(/Kari/)).toBeInTheDocument();
  });
});

describe("TaskEditAction form input", () => {
  it("lets the user type a new name", async () => {
    const bruker = userEvent.setup();
    renderForm();

    const input = screen.getByLabelText("Name:") as HTMLInputElement;
    await bruker.clear(input);
    await bruker.type(input, "Nytt navn");

    expect(input.value).toBe("Nytt navn");
  });

  it("carries the HTML validation attributes", () => {
    renderForm();

    const input = screen.getByLabelText("Name:");
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("minLength", "3");
    expect(input).toHaveAttribute("maxLength", "200");
  });
});

describe("TaskEditAction actions", () => {
  it("calls the server action with the form fields on submit", async () => {
    const bruker = userEvent.setup();
    editTaskAction.mockResolvedValue({
      success: true,
      data: { id: "t1", name: "Nytt navn" },
    });
    renderForm();

    const input = screen.getByLabelText("Name:");
    await bruker.clear(input);
    await bruker.type(input, "Nytt navn");
    await bruker.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(editTaskAction).toHaveBeenCalledTimes(1));

    // The second argument is the FormData React passes in.
    const formData = editTaskAction.mock.calls[0][1] as FormData;
    expect(formData.get("name")).toBe("Nytt navn");
    expect(formData.get("id")).toBe("t1");
  });

  it("shows the error message when the action fails", async () => {
    const bruker = userEvent.setup();
    editTaskAction.mockResolvedValue({
      success: false,
      error: { message: "Task not found", code: 404 },
      state: { id: "t1", name: "Nytt navn" },
    });
    renderForm();

    await bruker.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Task not found");
  });
});

describe("TaskEditAction timing", () => {
  it("shows the skeleton while the action is pending and the form again afterwards", async () => {
    const bruker = userEvent.setup();

    // We control when the action settles, so there is time to observe the
    // `isPending` state between the click and the response.
    let ferdigstill: (verdi: unknown) => void = () => {};
    editTaskAction.mockImplementation(
      () => new Promise((resolve) => (ferdigstill = resolve))
    );

    renderForm();
    await bruker.click(screen.getByRole("button", { name: "Save" }));

    // In flight: the form is replaced by the skeleton.
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument()
    );

    // Let the action finish.
    ferdigstill({ success: true, data: { id: "t1", name: "Ferdig" } });

    // Afterwards: the form is back, with the new name.
    const input = (await screen.findByLabelText("Name:")) as HTMLInputElement;
    expect(input.value).toBe("Ferdig");
  });
});
