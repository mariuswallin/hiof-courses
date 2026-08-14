// app/lib/utils/validators.ts

import type { Question } from "@/app/types/question";
import { QuestionStatus } from "@/app/types/question";

// Type guard preventing runtime errors by checking if an object is a valid Question
export function isValidQuestion(obj: any): obj is Question {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.id === "string" &&
    typeof obj.question === "string" &&
    Array.isArray(obj.answers) &&
    Object.values(QuestionStatus).includes(obj.status) &&
    obj.createdAt instanceof Date
  );
}

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
