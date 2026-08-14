// app/components/QuestionRow.tsx

import { ActionButtons } from "./ActionButtons";
import { formatDate } from "../lib/formatters";
import type { Question } from "../types/core";

interface QuestionRowProps {
  question: Question;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function QuestionRow({
  question,
  onView,
  onEdit,
  onDelete,
}: QuestionRowProps) {
  return (
    <tr key={question.id}>
      <td>{question.question}</td>
      <td>{question.answers.length}</td>
      <td>
        <span className={`status-badge status-${question.status}`}>
          {question.status}
        </span>
      </td>
      <td>{formatDate(question.createdAt)}</td>
      <td>
        <ActionButtons
          onView={() => onView(question.id)}
          onEdit={() => onEdit(question.id)}
          onDelete={() => onDelete(question.id)}
        />
      </td>
    </tr>
  );
}
