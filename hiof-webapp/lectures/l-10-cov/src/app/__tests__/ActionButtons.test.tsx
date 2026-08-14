// app/components/__tests__/ActionButtons.test.tsx

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { ActionButtons } from "../components/ActionButtons";

// MOCKING: Mock functions for callbacks
// These will be used to verify that the buttons call the correct functions
const mockOnView = vi.fn();
const mockOnEdit = vi.fn();
const mockOnDelete = vi.fn();

// SETUP: Reset mock functions before each test
beforeEach(() => {
  mockOnView.mockClear();
  mockOnEdit.mockClear();
  mockOnDelete.mockClear();
});

// Unit testing: This test suite checks the functionality of the ActionButtons component
describe("ActionButtons", () => {
  it("render buttons with correct labels", () => {
    // ARRANGE: Set up the component with mock functions
    render(
      <ActionButtons
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // ASSERT: Check that all buttons are rendered with correct labels
    expect(
      screen.getByRole("button", { name: /se detaljer/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /rediger spørsmål/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /slett spørsmål/i })
    ).toBeInTheDocument();
  });

  it("calls onView when View button is clicked", async () => {
    // ARRANGE: Set up the component with mock functions
    const user = userEvent.setup();

    render(
      <ActionButtons
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // ACT: Simulate a click on the "Se" button
    const viewButton = screen.getByRole("button", { name: /se detaljer/i });
    await user.click(viewButton);

    // ASSERT: Check that the correct callback was called with the right arguments
    expect(mockOnView).toHaveBeenCalledTimes(1);
    expect(mockOnEdit).not.toHaveBeenCalled();
    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it("adds extra CSS class when className prop is passed", () => {
    // ARRANGE
    render(
      <ActionButtons
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        className="extra-class"
      />
    );

    // ACT (implicit - rendering)
    const buttonContainer = screen.getByRole("button", {
      name: /se detaljer/i,
    }).parentElement;

    // ASSERT
    expect(buttonContainer).toHaveClass("action-buttons", "extra-class");
  });
});
