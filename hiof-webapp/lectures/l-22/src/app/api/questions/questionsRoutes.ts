// app/api/questions/questionsRoutes.ts

import { route } from "rwsdk/router";
import { questionController } from "./questionsController";
import { methodNotAllowedResponse } from "@/app/lib/utils/response";

export const questionRoutes = [
  route("/", async (ctx) => {
    const method = ctx.request.method.toLowerCase();
    switch (method) {
      case "get":
        return questionController.listQuestions(ctx);
      case "post":
        return questionController.createQuestion(ctx);
      default:
        return methodNotAllowedResponse(["GET", "POST"]);
    }
  }),

  route("/:id", async (ctx) => {
    const method = ctx.request.method.toLowerCase();
    switch (method) {
      case "get":
        return questionController.getQuestionById(ctx);
      case "put":
      case "patch":
        return questionController.updateQuestion(ctx);
      case "delete":
        return questionController.deleteQuestion(ctx);
      default:
        return methodNotAllowedResponse(["GET", "PUT", "PATCH", "DELETE"]);
    }
  }),

  route("/:id/publish", async (ctx) => {
    if (ctx.request.method === "POST") {
      return questionController.publishQuestion(ctx);
    }
    return methodNotAllowedResponse(["POST"]);
  }),
];
