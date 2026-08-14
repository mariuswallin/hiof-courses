// app/components/QuestionsPage.tsx
"use client";

import { useTableFilters } from "../hooks/useTableFilters";
import { TableFilters } from "./TableFilters";
import { QuestionTable } from "./QuestionTable";
import type { Question } from "../types/core";

const mockQuestions: Question[] = [
  {
    id: "1",
    question: "Hva er hovedformålet med React hooks?",
    answers: [
      { id: "1a", text: "Å erstatte class-komponenter" },
      { id: "1b", text: "Å håndtere state i funksjonelle komponenter" },
      { id: "1c", text: "Å forbedre performance" },
    ],
    createdAt: new Date("2024-01-15"),
    status: "published",
  },
  {
    id: "2",
    question: "Hvilken hook brukes for side effects?",
    answers: [
      { id: "2a", text: "useState" },
      { id: "2b", text: "useEffect" },
      { id: "2c", text: "useContext" },
    ],
    createdAt: new Date("2024-01-10"),
    status: "draft",
  },
  {
    id: "3",
    question: "Hva står JSX for?",
    answers: [
      { id: "3a", text: "JavaScript XML" },
      { id: "3b", text: "Java Syntax Extension" },
      { id: "3c", text: "JSON XML" },
    ],
    createdAt: new Date("2024-01-20"),
    status: "published",
  },
  {
    id: "4",
    question: "Hvordan håndterer man conditional rendering i React?",
    answers: [
      { id: "4a", text: "Med if-statements" },
      { id: "4b", text: "Med ternary operator eller logical AND" },
      { id: "4c", text: "Med switch-statements" },
    ],
    createdAt: new Date("2024-01-05"),
    status: "archived",
  },
];

export function QuestionsPage() {
  const { filters, actions, filteredQuestions } =
    useTableFilters(mockQuestions);

  const handleView = (id: string) => {
    console.log("Viser spørsmål:", id);
    // Here we would navigate to a detail page
  };

  const handleEdit = (id: string) => {
    console.log("Redigerer spørsmål:", id);
    // Here we would open an edit modal, or navigate to an edit page
  };

  const handleDelete = (id: string) => {
    console.log("Sletter spørsmål:", id);
    // Here we would show a confirmation and perform the delete
  };

  return (
    <div className="question-table-page">
      <header className="page-header">
        <h1>Spørsmålshåndtering</h1>
        <p>Administrer og organiser dine spørsmål</p>
      </header>

      <TableFilters
        filters={filters}
        actions={actions}
        totalQuestions={mockQuestions.length}
        filteredCount={filteredQuestions.length}
      />

      <QuestionTable
        questions={filteredQuestions}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
