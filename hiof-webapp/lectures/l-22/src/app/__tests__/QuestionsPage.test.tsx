// /app/components/questions/pages/QuestionPage.tsx

import { render, screen } from "@testing-library/react";

import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

import { questionsClient } from "@/app/lib/api/question-client";
import type { Question } from "../types/question";
import type { Result } from "../types/result";
import { QuestionsPage } from "../components/questions/pages/QuestionPage";

// The page loads through questionsClient, which returns a Result rather than a
// bare array. Mocking the client keeps the test on the component's own
// behaviour: loading state, rendering and the error path.
vi.mock("@/app/lib/api/question-client", () => ({
  questionsClient: {
    list: vi.fn(),
    getById: vi.fn(),
  },
}));

const mockClient = vi.mocked(questionsClient);

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

const success = (questions: Question[]): Result<Question[]> => ({
  success: true,
  data: questions,
  pagination: {
    page: 1,
    limit: 25,
    total: questions.length,
    pages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
});

describe("QuestionsPage", () => {
  let mockConsoleLog: ReturnType<typeof vi.spyOn>;
  let mockConsoleError: ReturnType<typeof vi.spyOn>;

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
      let resolvePromise: (value: Result<Question[]>) => void;
      const pendingPromise = new Promise<Result<Question[]>>((resolve) => {
        resolvePromise = resolve;
      });
      mockClient.list.mockReturnValue(pendingPromise);

      // ACT: Render page
      render(<QuestionsPage />);
      const loadingElement = await screen.findByTestId("loading");

      // ASSERT: Use async selectors instead of waitFor
      expect(loadingElement).toBeInTheDocument();
      expect(screen.getByText(/henter data fra server/i)).toBeInTheDocument();

      // CLEANUP: Resolve promise to avoid hanging test
      resolvePromise!(success(mockQuestions));

      // Use async selector to wait for loading to disappear
      await expect(
        screen.findByText(/react hooks/i)
      ).resolves.toBeInTheDocument();
      expect(loadingElement).not.toBeInTheDocument();
    });
  });

  describe("Testing Loaded State", () => {
    it("renders every question returned by the client", async () => {
      mockClient.list.mockResolvedValue(success(mockQuestions));

      render(<QuestionsPage />);

      await expect(
        screen.findByText(/react hooks/i)
      ).resolves.toBeInTheDocument();
      expect(screen.getByText(/typescript generics/i)).toBeInTheDocument();
      expect(screen.getByText(/next.js routing/i)).toBeInTheDocument();
    });
  });

  describe("Testing Error State", () => {
    it("shows the error state when the client fails", async () => {
      mockClient.list.mockResolvedValue({
        success: false,
        error: { message: "Kunne ikke hente spørsmål", code: "INTERNAL_SERVER_ERROR" },
      } as Result<Question[]>);

      render(<QuestionsPage />);

      await expect(
        screen.findByText(/kunne ikke hente spørsmål/i)
      ).resolves.toBeInTheDocument();
    });
  });
});
