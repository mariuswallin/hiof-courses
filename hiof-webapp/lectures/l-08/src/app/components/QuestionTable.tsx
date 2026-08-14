// app/components/QuestionTable.tsx

import { QuestionRow } from "./QuestionRow";
import type { Question } from "../types/core";

interface QuestionTableProps {
  questions: Question[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  className?: string;
}

export function QuestionTable({
  questions,
  onView,
  onEdit,
  onDelete,
  className = "",
}: QuestionTableProps) {
  if (questions.length === 0) {
    return (
      <div className="no-results">
        <p>Ingen spørsmål funnet</p>
        <p className="no-results-subtitle">
          Prøv å justere søket eller filtreringskriteriene
        </p>
      </div>
    );
  }

  return (
    <section className={`table-container ${className}`}>
      <table className="questions-table">
        <thead>
          <tr>
            <th>Spørsmål</th>
            <th>Antall svar</th>
            <th>Status</th>
            <th>Opprettet</th>
            <th>Handlinger</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((question) => (
            <QuestionRow
              key={question.id}
              question={question}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </section>
  );
}
