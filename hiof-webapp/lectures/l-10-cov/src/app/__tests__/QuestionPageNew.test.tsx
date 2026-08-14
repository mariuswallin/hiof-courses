// app/components/__tests__/QuestionsPageNew.test.tsx

import { render, screen } from "@testing-library/react";
import type { Question } from "../types/core";
import { QuestionsPage } from "../components/QuestionsPage";
import { describe, it, expect } from "vitest";

// Specific test data for each test
const testQuestions: Question[] = [
  {
    id: "test1",
    question: "Test spørsmål 1",
    answers: [{ id: "a1", text: "Test svar" }],
    status: "published",
    createdAt: new Date("2024-01-01"),
  },
];

describe("QuestionsPage", () => {
  it("renders with given questions", () => {
    render(<QuestionsPage initialQuestions={testQuestions} />);

    expect(screen.getByText("Test spørsmål 1")).toBeInTheDocument();
  });

  it("handles empty question list", () => {
    render(<QuestionsPage initialQuestions={[]} />);

    expect(screen.getByText(/ingen spørsmål funnet/i)).toBeInTheDocument();
  });

  it("shows correct count with filtered questions (screen query)", async () => {
    render(<QuestionsPage initialQuestions={testQuestions} />);

    // Use a function matcher to handle text broken up by multiple elements
    const resultsInfo = await screen.getByTestId("results-info");
    expect(resultsInfo).toHaveTextContent("Viser 1 av 1 spørsmål");
  });
});
