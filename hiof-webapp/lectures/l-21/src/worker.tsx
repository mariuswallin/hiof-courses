// src/worker.tsx

import { defineApp } from "rwsdk/worker";
import { prefix, render, route } from "rwsdk/router";
import { Document } from "@/app/Document";
import { setupDb, type DB } from "@/db";
import { setCommonHeaders } from "./app/headers";
import { Question } from "./app/pages/Question";
import { Questions } from "./app/pages/Questions";

import { env } from "cloudflare:workers";
import { questionRoutes } from "./app/api/questions/questionsRoutes";
import { QuestionEditPage } from "./app/components/pages/QuestionEditPage";
import { QuestionListPage } from "./app/components/pages/QuestionListPage";
import { QuestionCreatePage } from "./app/components/pages/QuestionCreatePage";
import { AnswerListPage } from "./app/components/pages/answers/AnswerListPage";
import { AnswerCreatePage } from "./app/components/pages/answers/AnswerCreatePage";
import type { AuthContext } from "./app/types/auth";
import { requireAdmin, requireAuth } from "./app/middleware/authorization";
import { authenticationMiddleware } from "./app/middleware/authentication";
import LoginPage from "./app/components/pages/auth/Login";
import RegisterPage from "./app/components/pages/auth/Register";
import { authService } from "./app/api/auth/authService";
import { createCookieResponse, createErrorResponse } from "./app/lib/response";
import { Errors } from "./app/types/errors";

import { RegisterDTOSchema } from "./app/lib/schema/auth/dtos";

export interface Env {
  DB: D1Database;
}

// Expands context to have authcontext
// Prevent type errors using ctx.user or ctx.session
export type AppContext = {
  db: DB;
} & AuthContext;

export default defineApp([
  setCommonHeaders(),
  // Database setup middleware
  async function setup({ ctx }) {
    // setup db - instance is available in ctx.db
    // can use it from ctx.db in handlers
    ctx.db = await setupDb(env.DB);
  },
  authenticationMiddleware, // Adding this to set the user and session
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
  // Auth routes if needed as an api-route
  prefix("/api/v1/auth", [
    //route("/login", async (ctx) => authService.login(ctx)),
    route("/register", async (ctx) => {
      const body = await ctx.request.json();
      const parsedData = RegisterDTOSchema.safeParse(body);
      if (!parsedData.success) {
        return createErrorResponse(
          Errors.VALIDATION_ERROR,
          `Validation failed: ${parsedData.error.message}`,
          400
        );
      }

      const { username, email, password } = parsedData.data;

      const result = await authService.register({
        username,
        email,
        password,
      });

      if (!result.success) {
        return createErrorResponse(
          Errors.INTERNAL_SERVER_ERROR,
          "Failed to register user",
          500
        );
      }

      return createCookieResponse(result.data.session.id);
    }),
  ]),
  render(Document, [
    route("/", () => <Questions />),
    // Simple pages to render
    prefix("/auth", [
      route("/login", () => <LoginPage />),
      route("/register", () => <RegisterPage />),
    ]),
    prefix("/questions", [
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
    route("/:id", Question), // Order (:id) catches /questions if placed before questions route
  ]),
]);
