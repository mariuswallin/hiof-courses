// app/types/core.ts
interface Answer {
  id: string;
  text: string;
}

interface Question {
  id: string;
  question: string;
  answers: Answer[];
  createdAt: Date;
  status: "draft" | "published" | "archived";
}

export type { Question, Answer };
