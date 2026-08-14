// __tests__/useTableFilters.test.ts

import { it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTableFilters } from "../hooks/useTableFilters";
import type { Question } from "../types/core";

// The hook filters the list it is given, so the test has to supply one.
const questions: Question[] = [
  {
    id: "1",
    question: "React spørsmål",
    status: "published",
    answers: [],
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    question: "Vue spørsmål",
    status: "published",
    answers: [],
    createdAt: new Date("2024-01-02"),
  },
];

it("should filter questions by search term", () => {
  const { result } = renderHook(() => useTableFilters(questions));

  act(() => {
    result.current.actions.setSearchTerm("React");
  });

  expect(result.current.filteredQuestions).toHaveLength(1);
  expect(result.current.filteredQuestions[0].question).toBe("React spørsmål");
});
