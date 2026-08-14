// app/components/__tests__/QuestionsPage.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterAll } from "vitest";
import { QuestionsPage } from "../components/QuestionsPage";

// SPY: Spy on console.log to verify interactions
const mockConsoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

// Integration testing: This test suite checks the functionality of the QuestionsPage component
describe("QuestionsPage", () => {
  // SETUP: Reset mock functions before each test
  beforeEach(() => {
    mockConsoleLog.mockClear();
  });

  // CLEANUP: Clean up after all tests
  afterAll(() => {
    mockConsoleLog.mockRestore();
  });
  it("renders the page with heading and description", () => {
    // ARRANGE & ACT: Render the entire page
    render(<QuestionsPage />);

    // ASSERT: Check that the main elements are there
    expect(
      screen.getByRole("heading", { name: /spørsmålshåndtering/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/administrer og organiser dine spørsmål/i)
    ).toBeInTheDocument();
  });

  it("can search and filter questions", async () => {
    // ARRANGE: Set up user-event and render the page
    const user = userEvent.setup();
    render(<QuestionsPage />);

    // ACT: Perform search (this tests the integration between many components)
    const searchInput = screen.getByLabelText(/søk i spørsmål/i);
    await user.type(searchInput, "React");

    // ASSERT: Check that the filtering works
    expect(screen.getByText(/react hooks/i)).toBeInTheDocument();
  });

  it("logs the correct message when view button is clicked", async () => {
    // ARRANGE: Set up user-event and render the page
    const user = userEvent.setup();
    render(<QuestionsPage />);

    // ACT: Click on a view button (this tests the integration of the callback system)
    const viewButtons = screen.getAllByRole("button", { name: /se detaljer/i });
    await user.click(viewButtons[0]);

    // ASSERT: Check that the spy function registered the call
    expect(mockConsoleLog).toHaveBeenCalledWith(
      "Viser spørsmål:",
      expect.any(String)
    );
  });
});
