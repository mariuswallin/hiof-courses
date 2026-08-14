// app/components/QuestionsPage.tsx

"use client";

import { useTableFilters } from "../hooks/useTableFilters";
import { TableFilters } from "./TableFilters";
import { QuestionTable } from "./QuestionTable";
import type { Question } from "../types/core";
import { questions } from "../data/questions";

interface QuestionsPageProps {
  initialQuestions?: Question[]; // Allow injection of initial data
  title?: string;
  subtitle?: string;
}

export function QuestionsPage({
  initialQuestions = questions, // Default fallback to mocked data
  title = "Spørsmålshåndtering",
  subtitle = "Administrer og organiser dine spørsmål",
}: QuestionsPageProps) {
  const { filters, filteredQuestions, actions } = useTableFilters({
    questions: initialQuestions,
  });

  const handleView = (id: string) => {
    console.log("Viser spørsmål:", id);
  };

  const handleEdit = (id: string) => {
    console.log("Redigerer spørsmål:", id);
  };

  const handleDelete = (id: string) => {
    console.log("Sletter spørsmål:", id);
  };

  return (
    <div className="question-table-page">
      <header className="page-header">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </header>

      <TableFilters
        filters={filters}
        actions={actions}
        totalQuestions={initialQuestions.length}
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
