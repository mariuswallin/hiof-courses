// src/app/lib/container.example.ts
//
// Example use of container.ts: registers the whole question stack and resolves
// the service. In worker.tsx the direct `createQuestionService(...)` calls
// could be replaced with `container.resolve("questionService")`. For an app
// this size that is overkill — but it shows the pattern.

import { createContainer } from "./container";
import { db, type DB } from "@/db";
import {
  createQuestionRepository,
  type QuestionRepository,
} from "@/app/api/questions/questionsRepository";
import {
  createQuestionService,
  type QuestionService,
} from "@/app/api/questions/questionsService";

type AppRegistry = {
  db: DB;
  questionRepository: QuestionRepository;
  questionService: QuestionService;
};

export const appContainer = createContainer<{}>()
  .register("db", () => db)
  .register("questionRepository", (c) =>
    createQuestionRepository(c.resolve("db" as never) as DB)
  )
  .register("questionService", (c) =>
    createQuestionService(
      c.resolve("questionRepository" as never) as QuestionRepository
    )
  );

// Bruk:
//   const service = appContainer.resolve("questionService" as never) as QuestionService;
//   await service.list({ page: 1, limit: 10 });

export type { AppRegistry };
