// app/worker.tsx

import { defineApp } from "rwsdk/worker";
import { prefix, render, route } from "rwsdk/router";
import { Document } from "@/app/Document";

import { setCommonHeaders } from "./app/headers";
import { Question } from "./app/pages/Question";
import { Questions } from "./app/pages/Questions";
import {
  listQuestions,
  getQuestionById,
  publishQuestionHandler,
  deleteQuestionHandler,
  updateQuestionHandler,
  createQuestionsHandler,
} from "@/app/api/questions/questionsHandler";

import { methodNotAllowedResponse } from "./app/lib/response";

export default defineApp([
  setCommonHeaders(),
  // First api routes
  prefix("/api/v1/questions", [
    route("/", async (ctx) => {
      const { request } = ctx;
      const method = request.method.toLowerCase();
      switch (method) {
        // GET all questions
        case "get":
          return listQuestions(ctx);
        case "post": {
          return createQuestionsHandler(ctx);
        }
        case "default":
          return methodNotAllowedResponse(["GET", "POST"]);
      }
    }),
    route("/:id", async (ctx) => {
      const { request } = ctx;
      const method = request.method.toLowerCase();
      switch (method) {
        // GET a specific question by ID
        case "get":
          return getQuestionById(ctx);
        case "put":
        case "patch": {
          return updateQuestionHandler(ctx);
        }
        case "delete":
          return deleteQuestionHandler(ctx);
        case "default":
          return methodNotAllowedResponse(["GET", "PUT", "PATCH", "DELETE"]);
      }
    }),
    route("/:id/publish", async (ctx) => {
      const { request } = ctx;
      if (request.method === "POST") {
        return publishQuestionHandler(ctx);
      }
      return methodNotAllowedResponse(["POST"]);
    }),
  ]),
  route("/api/health", () => {
    // GET /api/health - always return current status
    // Used by load balancers and monitoring systems
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          status: "healthy",
          timestamp: new Date().toISOString(),
          version: "1.0.0",
          uptime: process.uptime?.() || "unknown",
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache", // Health checks should not be cached
          "Access-Control-Allow-Origin": "*", // Allow CORS for health checks
        },
      }
    );
  }),
  // Define routes for the Questions app
  render(Document, [
    route("/", () => {
      return <Questions />;
    }),
    route("/:id", Question),
  ]),
]);
