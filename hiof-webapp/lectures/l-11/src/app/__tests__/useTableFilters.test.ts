// __tests__/useTableFilters.test.ts

import { it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTableFilters } from "../hooks/useTableFilters";
import { QuestionStatus } from "../types/core";

it("should filter questions by search term", () => {
  const mockQuestions = [
    {
      id: "1",
      question: "React spørsmål",
      status: QuestionStatus.PUBLISHED,
      answers: [],
      createdAt: new Date(),
    },
    {
      id: "2",
      question: "Vue spørsmål",
      status: QuestionStatus.PUBLISHED,
      answers: [],
      createdAt: new Date(),
    },
  ];

  const { result } = renderHook(() =>
    useTableFilters({ questions: mockQuestions })
  );

  act(() => {
    result.current.actions.setSearchTerm("React");
  });

  expect(result.current.filteredQuestions).toHaveLength(1);
  expect(result.current.filteredQuestions[0].question).toBe("React spørsmål");
});
