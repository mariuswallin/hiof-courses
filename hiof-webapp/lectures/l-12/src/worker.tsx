// app/worker.tsx

import { defineApp } from "rwsdk/worker";
import { render, route } from "rwsdk/router";
import { Document } from "@/app/Document";

import { setCommonHeaders } from "./app/headers";
import { Question } from "./app/pages/Question";
import { Questions } from "./app/pages/Questions";

export default defineApp([
  setCommonHeaders(),
  render(Document, [
    route("/", () => {
      return <Questions />;
    }),
    route("/:id", Question),
  ]),
]);
