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
} from "@/app/api/questions/questionsHandler";

export default defineApp([
  setCommonHeaders(),
  // First api routes
  prefix("/api/v1/questions", [
    route("/", listQuestions),
    route("/:id", getQuestionById),
  ]),
  // Define routes for the Questions app
  render(Document, [
    route("/", () => {
      return <Questions />;
    }),
    route("/:id", Question),
  ]),
]);
