// /app/components/__tests__/QuestionsPage.test.tsx

import { render, screen } from "@testing-library/react";

import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

import * as questionsApi from "../services/questionsApi";
import type { Question } from "../types/core";
import { QuestionsPage } from "../components/QuestionsPage";

vi.mock("../services/questionsApi", () => ({
  listQuestions: vi.fn(),
  getQuestionById: vi.fn(),
}));

const mockApi = vi.mocked(questionsApi);

// MOCK DATA: Test data for consistent testing
const mockQuestions: Question[] = [
  {
    id: "1",
    question: "React hooks",
    answers: [],
    status: "published",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    question: "TypeScript generics",
    answers: [],
    status: "published",
    createdAt: new Date("2024-01-02"),
  },
  {
    id: "3",
    question: "Next.js routing",
    answers: [],
    status: "draft",
    createdAt: new Date("2024-01-03"),
  },
];

describe.only("QuestionsPage", () => {
  let mockConsoleLog: any;
  let mockConsoleError: any;
  beforeEach(() => {
    // SPY: Spy on console.log and console.error to verify interactions
    mockConsoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
    mockConsoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe("Testing Loading State", () => {
    it("shows loading spinner while fetching data", async () => {
      // ARRANGE: Mock API to never resolve (simulate slow network)
      let resolvePromise: (value: Question[]) => void;
      const pendingPromise = new Promise<any>((resolve) => {
        resolvePromise = resolve;
      });
      mockApi.listQuestions.mockReturnValue(pendingPromise);

      // ACT: Render page
      render(<QuestionsPage />);
      const loadingElement = await screen.findByTestId("loading");

      // ASSERT: Use async selectors instead of waitFor
      expect(loadingElement).toBeInTheDocument();
      expect(screen.getByText(/henter data fra server/i)).toBeInTheDocument();

      // CLEANUP: Resolve promise to avoid hanging test
      resolvePromise!({
        data: mockQuestions,
        total: mockQuestions.length,
        page: 1,
        totalPages: 1,
      });

      // Use async selector to wait for loading to disappear
      await expect(
        screen.findByText(/react hooks/i)
      ).resolves.toBeInTheDocument();
      expect(loadingElement).not.toBeInTheDocument();
    });
  });
});
