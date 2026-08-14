// src/app/features/tasks/tasks-routes.ts

import { route } from "rwsdk/router";
import { taskController } from "./tasksController";

export const taskRoutes = [
  route("/", async (ctx) => {
    const method = ctx.request.method.toLowerCase();
    switch (method) {
      case "get":
        return taskController.listTasks(ctx);
      case "post":
        return taskController.createTask(ctx);
      default:
        return new Response(null, { status: 405 });
    }
  }),

  route("/:id", async (ctx) => {
    const method = ctx.request.method.toLowerCase();
    switch (method) {
      case "get":
        return taskController.getTaskById(ctx);
      case "put":
      case "patch":
        return taskController.updateTask(ctx);
      case "delete":
        return taskController.deleteTask(ctx);
      default:
        return new Response(null, { status: 405 });
    }
  }),

  route("/:id/complete", async (ctx) => {
    if (ctx.request.method === "POST") {
      return taskController.completeTask(ctx);
    }
    return new Response(null, { status: 405 });
  }),

  route("/:id/incomplete", async (ctx) => {
    if (ctx.request.method === "POST") {
      return taskController.incompleteTask(ctx);
    }
    return new Response(null, { status: 405 });
  }),

  route("/users/:userId", async (ctx) => {
    if (ctx.request.method === "GET") {
      return taskController.getUserTasks(ctx);
    }
    return new Response(null, { status: 405 });
  }),
];
