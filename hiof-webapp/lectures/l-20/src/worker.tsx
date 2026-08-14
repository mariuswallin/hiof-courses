// src/worker.tsx

import { defineApp } from "rwsdk/worker";
import { prefix, render, route } from "rwsdk/router";
import { env } from "cloudflare:workers";

import { Document } from "@/app/Document";
import { setupDb, type DB } from "@/db";
import { setCommonHeaders } from "./app/headers";
import { auth } from "@/auth/auth";
import { authMiddleware } from "@/auth/middleware";

import { Question } from "./app/pages/Question";
import { Questions } from "./app/pages/Questions";
import { questionRoutes } from "./app/api/questions/questionsRoutes";
import { QuestionEditPage } from "./app/components/pages/QuestionEditPage";
import { QuestionListPage } from "./app/components/pages/QuestionListPage";
import { QuestionCreatePage } from "./app/components/pages/QuestionCreatePage";
import { AnswerListPage } from "./app/components/pages/answers/AnswerListPage";
import { AnswerCreatePage } from "./app/components/pages/answers/AnswerCreatePage";

export interface Env {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
}

export type AppContext = {
  db: DB;
};

export default defineApp([
  setCommonHeaders(),
  async function setup({ ctx }) {
    ctx.db = await setupDb(env.DB);
  },
  authMiddleware,

  // better-auth tar over /api/auth/* — login/register/logout/session
  route("/api/auth/*", ({ request }) => auth.handler(request)),

  prefix("/api/v1/questions", questionRoutes),
  route("/api/health", () => {
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          status: "healthy",
          timestamp: new Date().toISOString(),
          version: "1.0.0",
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      }
    );
  }),

  render(Document, [
    route("/", () => <Questions />),
    prefix("/questions", [
      route("/", QuestionListPage),
      route("/new", () => <QuestionCreatePage />),
      route("/:id", Question),
      route("/:id/edit", ({ params }) => <QuestionEditPage id={params.id} />),
      route("/:id/answers", ({ params }) => (
        <AnswerListPage questionId={params.id} />
      )),
      route("/:id/answers/new", ({ params }) => (
        <AnswerCreatePage questionId={params.id} />
      )),
    ]),
    route("/:id", Question),
  ]),
]);
