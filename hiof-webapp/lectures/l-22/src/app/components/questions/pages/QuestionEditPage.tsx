// src/app/components/questions/pages/QuestionEditPage.tsx

import { Suspense } from "react";

import { QuestionForm } from "@/app/components/questions/forms/QuestionForm";
import { questionService } from "@/app/api/questions/questionsService";

function ErrorPage({ error }: { error: Error }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
      {error.message}
    </div>
  );
}

async function QuestionEditData({ id }: { id: string }) {
  const result = await questionService.get(id);

  if (!result.success) {
    return <ErrorPage error={new Error(`Kunne ikke hente spørsmål`)} />;
  }

  return <QuestionForm question={result.data} />;
}

export function QuestionEditPage({ id }: { id: string }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="mb-6">
          <a
            href={`/questions/${id}`}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Tilbake til spørsmål
          </a>
        </div>

        <div className="bg-white rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Rediger spørsmål
          </h1>

          <Suspense
            fallback={
              <div className="animate-pulse bg-gray-200 h-64 rounded"></div>
            }
          >
            <QuestionEditData id={id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
