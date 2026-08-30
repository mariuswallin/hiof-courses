// src/db/relations.ts
//
// Relations v2. From Drizzle v1 relations are no longer declared per table
// with `relations(table, ...)` but in one `defineRelations` call.
//
// What changed from v0:
//   `fields`/`references`  ->  `from`/`to`
//   `optional: false`          makes the related row non-nullable in the type
//   `r`                        gives autocomplete for every table in the schema
//
// The object is passed to `drizzle(..., { relations })` in ./index.ts and is
// what drives the relational queries (`db.query.*`).
import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  users: {
    tasks: r.many.tasks({ from: r.users.id, to: r.tasks.userId }),
  },
  tasks: {
    user: r.one.users({
      from: r.tasks.userId,
      to: r.users.id,
      optional: false,
    }),
  },
}));

export type Relations = typeof relations;
