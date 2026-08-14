// src/app/components/questions/pages/QuestionListPage.tsx

import { questionService } from "@/app/api/questions/questionsService";
import { Suspense } from "react";

async function QuestionsData() {
  const result = await questionService.list({ limit: 50 });

  if (!result.success) {
    throw new Error(`Kunne ikke hente spørsmål: ${result.error.message}`);
  }

  const questions = result.data.questions;

  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <div key={question.id} className="bg-white border rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium">
                <a
                  href={`/questions/${question.id}`}
                  className="hover:text-blue-600"
                >
                  {question.question}
                </a>
              </h3>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span>Status: {question.status}</span>
                <span>{question.answersCount || 0} svar</span>
                <span>
                  Opprettet:{" "}
                  {new Date(question.createdAt).toLocaleDateString("no-NO")}
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              <a
                href={`/questions/${question.id}/edit`}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Rediger
              </a>
              <a
                href={`/questions/${question.id}/answers/new`}
                className="text-green-600 hover:text-green-800 text-sm"
              >
                Legg til svar
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function QuestionsLoading() {
  return (
    <div className="animate-pulse space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-gray-200 h-24 rounded"></div>
      ))}
    </div>
  );
}

export function QuestionListPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Spørsmål</h1>
          <a
            href="/questions/new"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Nytt spørsmål
          </a>
        </div>

        <Suspense fallback={<QuestionsLoading />}>
          <QuestionsData />
        </Suspense>
      </div>
    </div>
  );
}
