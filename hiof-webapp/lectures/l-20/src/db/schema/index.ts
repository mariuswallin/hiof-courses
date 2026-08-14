// src/db/schema/index.ts

export {
  users,
  sessions,
  accounts,
  verifications,
  type User,
  type Session,
} from "./auth-schema";
export { userRelations } from "./user-schema";
export * from "./question-schema";
export * from "./answer-schema";
