// app/data/questions.ts

import type { Question, QuestionStatus } from "../types/core";

export const questions: Question[] = [
  {
    id: "1",
    question: "Hva er hovedformålet med React hooks?",
    answers: [
      { id: "1a", text: "Å erstatte class-komponenter" },
      { id: "1b", text: "Å håndtere state i funksjonelle komponenter" },
      { id: "1c", text: "Å forbedre performance" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    question: "Hvordan fungerer state management i React applikasjoner?",
    answers: [
      { id: "2a", text: "Gjennom useState hook" },
      { id: "2b", text: "Med Redux eller Context API" },
    ],
    status: "published" as QuestionStatus,
    createdAt: new Date("2024-01-14"),
  },
  {
    id: "3",
    question: "Hva er fordelene med TypeScript i React?",
    answers: [
      { id: "3a", text: "Type-sikkerhet" },
      { id: "3b", text: "Bedre IDE-støtte" },
      { id: "3c", text: "Færre runtime-feil" },
    ],
    status: "archived" as QuestionStatus,
    createdAt: new Date("2024-01-12"),
  },
];

// Data sets for different test scenarios
export const emptyQuestions: Question[] = [];

export const archivedOnlyQuestions: Question[] = [
  {
    id: "arch1",
    question: "Arkivert spørsmål 1",
    answers: [{ id: "a1", text: "Svar 1" }],
    status: "archived" as QuestionStatus,
    createdAt: new Date("2024-01-01"),
  },
];
