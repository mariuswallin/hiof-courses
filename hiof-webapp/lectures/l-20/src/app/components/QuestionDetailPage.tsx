// /app/components/QuestionDetail.tsx
"use client";

import { useEffect, useState } from "react";
import { Loading } from "./Loading";
import { ErrorState } from "./ErrorState";
import type { Question } from "../types/question";
import { questionsClient } from "../services/api/questions";

interface QuestionDetailProps {
  id: string;
}

export function QuestionDetail({ id }: QuestionDetailProps) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading"
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestion = async () => {
      const result = await questionsClient.get({
        identifier: id,
      });
      if (!result.success) {
        setStatus("error");
        setError(result.error.message || "Kunne ikke hente spørsmål");
        return;
      }

      setQuestion(result.data);
      setStatus("success");
    };

    fetchQuestion();
  }, [id]);

  if (status === "loading") {
    return <Loading title="Henter spørsmålsdetaljer..." />;
  }

  if (status === "error" || !question) {
    return (
      <ErrorState
        message={error || "Spørsmål ikke funnet"}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "draft":
        return "Utkast";
      case "published":
        return "Publisert";
      case "archived":
        return "Arkivert";
      default:
        return status;
    }
  };

  const getStatusStyles = (status: string): string => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <main className="p-8 sm:p-4 max-w-4xl mx-auto" role="main">
        <header className="mb-8">
          <div className="flex items-center gap-2">
            <span
              className={`mb-1 px-2 py-1 rounded text-xs font-medium ${getStatusStyles(
                question.status
              )}`}
            >
              {getStatusLabel(question.status)}
            </span>
          </div>
          <h1 className="mb-4 text-3xl sm:text-2xl leading-tight text-gray-900 font-bold">
            {question.question}
          </h1>
        </header>

        {question?.answers?.length === 0 ? (
          <p className="text-gray-500 italic p-4 text-center">
            Ingen svar er lagt til ennå.
          </p>
        ) : (
          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Alle svar
            </h2>
            <ul className="flex flex-col gap-3 list-none p-0 m-0">
              {question?.answers?.map((answer, index) => (
                <li
                  key={answer.id}
                  className="
                  p-4 rounded-lg border-2 transition-all duration-200 min-h-12
                  flex justify-between items-center gap-4
                  sm:flex-col sm:items-start sm:gap-2
                  hover:shadow-md focus-within:outline focus-within:outline-blue-500 focus-within:outline-offset-2
                  motion-reduce:transition-none
                  border-gray-300 bg-white hover:border-gray-400
                "
                  role="listitem"
                >
                  <span
                    className="text-base leading-6 flex-1"
                    id={`answer-text-${answer.id}`}
                  >
                    <span className="sr-only">Svar {index + 1}: </span>
                    {answer.answer}
                  </span>
                </li>
              ))}
            </ul>

            {question.answers.length === 0 && (
              <p
                className="text-gray-500 italic p-4 text-center"
                role="status"
                aria-live="polite"
              >
                Ingen svar er lagt til ennå.
              </p>
            )}
          </section>
        )}
      </main>
    </>
  );
}
