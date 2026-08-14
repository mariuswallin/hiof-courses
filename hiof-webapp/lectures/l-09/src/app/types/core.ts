// app/types/core.ts

export interface Question {
  readonly id: string; // Readonly property to prevent modification
  question: string;
  answers: Answer[];
  status: QuestionStatus;
  createdAt: Date;
}

export interface Answer {
  readonly id: string; // Readonly property to prevent modification
  text: string;
}

// Better than enums are const objects for type safety and performance
// This allows for better tree-shaking and avoids issues with enum values being numbers
// It also provides a clear mapping of status values to their string representations
// Using 'as const' ensures that the values are treated as literal types
export const QuestionStatus = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
} as const;

// Type for QuestionStatus that can be used in type annotations
export type QuestionStatus =
  (typeof QuestionStatus)[keyof typeof QuestionStatus];

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
