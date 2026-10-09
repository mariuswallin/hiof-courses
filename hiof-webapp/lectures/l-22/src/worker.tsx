// src/worker.tsx

import { defineApp } from "rwsdk/worker";
import { layout, prefix, render, route } from "rwsdk/router";
import { Document } from "@/app/Document";
import { setupDb, type DB } from "@/db";
import { setCommonHeaders } from "@/app/headers";
import { Question } from "@/app/pages/Question";
import { Questions } from "@/app/pages/Questions";

import { env } from "cloudflare:workers";
import { questionRoutes } from "@/app/api/questions/questionsRoutes";
import { QuestionEditPage } from "@/app/components/questions/pages/QuestionEditPage";
import { QuestionListPage } from "@/app/components/questions/pages/QuestionListPage";
import { QuestionCreatePage } from "@/app/components/questions/pages/QuestionCreatePage";

// Auth from l-20 (better-auth): authMiddleware sets ctx.user and ctx.session
import { auth } from "@/auth/auth";
import { authMiddleware } from "@/auth/middleware";
import { requireAdmin, requireAuth } from "@/app/middleware/authorization";
import LoginPage from "@/app/components/auth/pages/LoginPage";
import RegisterPage from "@/app/components/auth/pages/RegisterPage";

import { MainLayout } from "@/app/components/layouts/MainLayout";
import { AnswerListPage } from "@/app/components/answers/pages/AnswerListPage";
import { AnswerCreatePage } from "@/app/components/answers/pages/AnswerCreatePage";

export interface Env {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
}

// ctx.user and ctx.session are typed in src/auth/middleware.ts
export type AppContext = {
  db: DB;
};

export default defineApp([
  setCommonHeaders(),
  // Database setup middleware
  async function setup({ ctx }) {
    // setup db - instance is available in ctx.db
    // can use it from ctx.db in handlers
    ctx.db = await setupDb(env.DB);
  },
  authMiddleware, // Sets ctx.user and ctx.session (null when signed out)

  // better-auth handles /api/auth/* (sign-in, sign-up, sign-out, get-session)
  route("/api/auth/*", ({ request }) => auth.handler(request)),

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
  // API routes
  prefix("/api/v1/questions", questionRoutes),
  render(Document, [
    route("/", () => <Questions />),
    // Simple pages to render
    prefix("/auth", [
      route("/login", () => <LoginPage />),
      route("/register", () => <RegisterPage />),
    ]),
    prefix("/questions", [
      layout(MainLayout, [
        route("/", QuestionListPage),
        // Admin role required => added as middleware (interrupters)
        route("/new", [requireAdmin(), QuestionCreatePage]),
        // Auth role required => added as middleware (interrupters)
        route("/:id", [requireAuth(), Question]),
        // Admin role required => added as middleware (interrupters)
        route("/:id/edit", [
          requireAdmin(),
          ({ params }) => <QuestionEditPage id={params.id} />,
        ]),
        route("/:id/answers", [
          requireAdmin(),
          ({ params }) => <AnswerListPage questionId={params.id} />,
        ]),
        route("/:id/answers/new", [
          requireAuth(),
          ({ params }) => <AnswerCreatePage questionId={params.id} />,
        ]),
      ]),
    ]),
    route("/:id", Question), // Order (:id) catches /questions if placed before questions route
  ]),
]);
