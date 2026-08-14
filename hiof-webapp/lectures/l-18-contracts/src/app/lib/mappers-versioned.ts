// src/app/lib/mappers-versioned.ts
//
// Version-aware mappers. When the API changes field names or structure over
// time without being able to force every client to upgrade at once, we keep
// several mapper versions and let the `Accept` header (or a `?version=` query)
// decide which one is used.
//
// Example:
//   GET /api/v1/questions/123  -> mapQuestionByVersion(question, "v1")
//   GET /api/v2/questions/123  -> mapQuestionByVersion(question, "v2")

import type { Question, Answer } from "@/db/schema";

type QuestionWithAnswers = Question & { answers: Answer[] };

// V1 — old field names, kept for backwards compatibility
export interface QuestionDTOV1 {
  id: string;
  text: string;
  created: string;
  answers: number;
}

// V2 — the current contract
export interface QuestionDTOV2 {
  id: string;
  question: string;
  createdAt: string;
  answersCount: number;
  status: string;
}

export function mapQuestionToDTOV1(question: QuestionWithAnswers): QuestionDTOV1 {
  return {
    id: question.id,
    text: question.question,
    created: question.createdAt.toISOString(),
    answers: question.answers?.length ?? 0,
  };
}

export function mapQuestionToDTOV2(question: QuestionWithAnswers): QuestionDTOV2 {
  return {
    id: question.id,
    question: question.question,
    createdAt: question.createdAt.toISOString(),
    answersCount: question.answers?.length ?? 0,
    status: question.status,
  };
}

export type ApiVersion = "v1" | "v2";

export function mapQuestionByVersion(
  question: QuestionWithAnswers,
  version: ApiVersion
): QuestionDTOV1 | QuestionDTOV2 {
  switch (version) {
    case "v1":
      return mapQuestionToDTOV1(question);
    case "v2":
      return mapQuestionToDTOV2(question);
    default:
      return mapQuestionToDTOV2(question);
  }
}

/**
 * Pick the version from the request. Priority: `?version=` > `Accept` header >
 * default (v2).
 *   Accept: application/vnd.app.v1+json  ->  v1
 *   Accept: application/vnd.app.v2+json  ->  v2
 */
export function pickVersion(request: Request): ApiVersion {
  const url = new URL(request.url);
  const queryVersion = url.searchParams.get("version");
  if (queryVersion === "v1" || queryVersion === "v2") return queryVersion;

  const accept = request.headers.get("Accept") ?? "";
  const match = accept.match(/application\/vnd\.app\.(v\d)\+json/);
  if (match?.[1] === "v1") return "v1";
  if (match?.[1] === "v2") return "v2";

  return "v2";
}
