// src/app/components/answers/AnswerList.tsx

"use client";

import type { AnswerDetailDTO } from "@/app/lib/schema/answers/answer-dtos";

interface AnswerListProps {
  answers: AnswerDetailDTO[];
}

export function AnswerList({ answers }: AnswerListProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Svar ({answers.length})</h3>

      {answers.length === 0 ? (
        <p className="text-gray-500">Ingen svar lagt til ennå.</p>
      ) : (
        <div className="space-y-2">
          {answers.map((answer) => (
            <div key={answer.id} className={`p-3 rounded border`}>
              <div className="flex justify-between items-start">
                <p className="text-gray-900">{answer.answer}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Opprettet:{" "}
                {new Date(answer.createdAt).toLocaleDateString("no-NO")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
