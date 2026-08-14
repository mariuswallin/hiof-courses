// src/app/pages/answers/AnswerCreatePage.tsx

import { AnswerForm } from "../../forms/AnswerForm";

export function AnswerCreatePage({ questionId }: { questionId: string }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="mb-6">
          <a href={`/questions`} className="text-blue-600 hover:text-blue-800">
            ← Tilbake til alle spørsmål
          </a>
        </div>

        <div className="bg-white rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Nytt svar</h1>
          <AnswerForm questionId={questionId} />
        </div>
      </div>
    </div>
  );
}
