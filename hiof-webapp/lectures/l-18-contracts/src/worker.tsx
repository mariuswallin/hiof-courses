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

export interface Env {
  DB: D1Database;
}

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
  // API routes
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

  render(Document, [route("/", () => <Questions />), route("/:id", Question)]),
]);
