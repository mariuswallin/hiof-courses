// app/lib/validators.ts

import type { Question } from "../types/core";
import { isValidQuestion } from "../types/core";

export function validateQuestions(questions: any[]): Question[] {
  if (!Array.isArray(questions)) {
    console.warn("Expected array of questions, received:", typeof questions);
    return [];
  }

  const validQuestions = questions.filter(isValidQuestion);

  if (validQuestions.length !== questions.length) {
    const invalidCount = questions.length - validQuestions.length;
    console.warn(`${invalidCount} invalid questions filtered out`);
  }

  return validQuestions;
}

// Usage example for safe parsing.
export function safeParseQuestions(data: unknown): Question[] {
  if (Array.isArray(data)) {
    return validateQuestions(data);
  }

  console.warn("Invalid questions data format");
  return [];
}
