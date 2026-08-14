// src/db/relations.ts — Relations v2.
//
// From Drizzle v1, relations are no longer `relations(table, ...)` per table
// but one combined `defineRelations(schema, ...)` call. `r` gives autocomplete
// for every table in the schema, `fields`/`references` are now `from`/`to`,
// and `optional: false` makes the related row non-nullable in the type.
//
// The object is passed to `drizzle(..., { relations })` in `./index.ts` and is
// what drives the relational queries (`db.query.*`).
import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  user: {
    posts: r.many.posts({ from: r.user.id, to: r.posts.authorId }),
    comments: r.many.comments({ from: r.user.id, to: r.comments.authorId }),
    likes: r.many.likes({ from: r.user.id, to: r.likes.userId }),
  },
  posts: {
    author: r.one.user({
      from: r.posts.authorId,
      to: r.user.id,
      optional: false,
    }),
    comments: r.many.comments({ from: r.posts.id, to: r.comments.postId }),
    likes: r.many.likes({ from: r.posts.id, to: r.likes.postId }),
  },
  comments: {
    post: r.one.posts({
      from: r.comments.postId,
      to: r.posts.id,
      optional: false,
    }),
    author: r.one.user({
      from: r.comments.authorId,
      to: r.user.id,
      optional: false,
    }),
  },
  likes: {
    post: r.one.posts({
      from: r.likes.postId,
      to: r.posts.id,
      optional: false,
    }),
    user: r.one.user({
      from: r.likes.userId,
      to: r.user.id,
      optional: false,
    }),
  },
}));

export type Relations = typeof relations;
