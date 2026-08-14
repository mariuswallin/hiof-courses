// app/types/question.ts

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

export type GetQuestionsParams = {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
};

// Type for parameters when creating a question
export type CreateQuestionParams = Omit<
  Question,
  "id" | "answers" | "createdAt"
>;

// Type for parameters when updating a question
export type UpdateQuestionParams = Partial<CreateQuestionParams> & {
  id: string;
};

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
