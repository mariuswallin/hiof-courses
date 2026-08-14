// src/app/__tests__/contract-tests.test.ts
//
// Contract tests enforce that the server mappers produce output matching the
// published contract (Zod schema), and that the client can safely validate a
// server response before using it.

import { describe, expect, it } from "vitest";

import {
  QuestionDTOSchema,
  QuestionDetailDTOSchema,
  CreateQuestionDTOSchema,
} from "@/app/lib/schema/questions/dtos";
import { mapQuestionToDTO } from "@/app/lib/mappers/questions";
import {
  validateServerContract,
  validateClientContract,
  tryClientContract,
} from "@/app/lib/contract-validators";
import { mapQuestionByVersion } from "@/app/lib/mappers-versioned";

const mockQuestion = {
  id: "q1",
  question: "Hva er TypeScript?",
  status: "published" as const,
  createdAt: new Date("2025-01-01"),
  updatedAt: null,
  publishedAt: new Date("2025-01-02"),
  deletedAt: null,
  authorId: 1,
  answers: [
    { id: "a1", answer: "Et programmeringsspråk", createdAt: new Date(), questionId: "q1" },
    { id: "a2", answer: "En type checker", createdAt: new Date(), questionId: "q1" },
  ],
};

describe("Server contract tests", () => {
  it("mapQuestionToDTO produserer gyldig QuestionDTO", () => {
    const dto = mapQuestionToDTO(mockQuestion as never);
    const result = QuestionDTOSchema.safeParse(dto);
    expect(result.success).toBe(true);
  });

  it("mappers eksponerer ikke interne felter", () => {
    const tainted = { ...mockQuestion, internalScore: 95, dbVersion: 3 };
    const dto = mapQuestionToDTO(tainted as never);
    expect(dto).not.toHaveProperty("internalScore");
    expect(dto).not.toHaveProperty("dbVersion");
  });

  it("validateServerContract kaster ved kontraktbrudd", () => {
    const corrupt = { id: 123, question: "" } as unknown;
    expect(() => validateServerContract(corrupt, QuestionDTOSchema)).toThrow();
  });
});

describe("Client contract tests", () => {
  it("validerer korrekt server-respons", () => {
    const response = {
      id: "q1",
      question: "Hva er TypeScript?",
      createdAt: "2025-01-01T00:00:00.000Z",
      answersCount: 2,
      status: "published",
    };
    expect(QuestionDTOSchema.safeParse(response).success).toBe(true);
  });

  it("avviser ugyldig server-respons", () => {
    const response = { id: 123, question: "", answersCount: -1, status: "unknown" };
    const result = QuestionDTOSchema.safeParse(response);
    expect(result.success).toBe(false);
  });

  it("tryClientContract returnerer null ved brudd (myk)", () => {
    const result = tryClientContract({ id: 123 }, QuestionDTOSchema);
    expect(result).toBeNull();
  });

  it("validerer input før sending til server", () => {
    const input = {
      question: "Nytt spørsmål",
      status: "draft" as const,
      answers: [{ answer: "Første svar" }, { answer: "Andre svar" }],
    };
    expect(CreateQuestionDTOSchema.safeParse(input).success).toBe(true);
  });
});

describe("Versjonering med mappers", () => {
  it("v1 returnerer gamle feltnavn", () => {
    const dto = mapQuestionByVersion(mockQuestion as never, "v1") as Record<string, unknown>;
    expect(dto).toHaveProperty("text"); // not "question"
    expect(dto).toHaveProperty("created"); // not "createdAt"
    expect(dto).not.toHaveProperty("status"); // v1 has no status
  });

  it("v2 returnerer ny kontrakt", () => {
    const dto = mapQuestionByVersion(mockQuestion as never, "v2") as Record<string, unknown>;
    expect(dto).toHaveProperty("question");
    expect(dto).toHaveProperty("createdAt");
    expect(dto).toHaveProperty("status");
    expect(dto.answersCount).toBe(2);
  });
});
