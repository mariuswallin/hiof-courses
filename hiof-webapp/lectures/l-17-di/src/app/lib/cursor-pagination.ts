// src/app/lib/cursor-pagination.ts
//
// Cursor-based pagination as an alternative to OFFSET. Useful when:
//   - OFFSET queries get slow (typically > 50k rows)
//   - Data is "real-time" and rows can be inserted or deleted while paging
//   - The UI uses infinite scroll instead of page numbers
//
// A cursor is an opaque base64 string encoding { createdAt, id } from the last
// row of the previous page.

import { and, asc, desc, eq, gt, lt, or, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { questions } from "@/db/schema";

export type Cursor = { createdAt: number; id: string };

export function encodeCursor(cursor: Cursor): string {
  return Buffer.from(JSON.stringify(cursor)).toString("base64url");
}

export function decodeCursor(encoded: string): Cursor | null {
  try {
    return JSON.parse(Buffer.from(encoded, "base64url").toString("utf-8"));
  } catch {
    return null;
  }
}

/**
 * Build a WHERE clause that filters rows after the cursor.
 * For DESC: rows where (createdAt < cursor.createdAt) OR (createdAt = cursor.createdAt and id < cursor.id).
 * For ASC: the other way around.
 *
 * The id is the tie-breaker when two rows share a createdAt.
 */
export function buildCursorWhere(
  cursor: Cursor,
  direction: "asc" | "desc"
): SQL {
  const cmp = direction === "desc" ? lt : gt;
  return or(
    cmp(questions.createdAt, new Date(cursor.createdAt)),
    and(
      eq(questions.createdAt, new Date(cursor.createdAt)),
      cmp(questions.id, cursor.id)
    )
  )!;
}

/**
 * Fetch one page with cursor pagination.
 */
export async function listQuestionsByCursor(params: {
  cursor?: string;
  limit?: number;
  direction?: "asc" | "desc";
}) {
  const limit = Math.min(params.limit ?? 50, 200);
  const direction = params.direction ?? "desc";
  const orderBy =
    direction === "desc"
      ? [desc(questions.createdAt), desc(questions.id)]
      : [asc(questions.createdAt), asc(questions.id)];

  const where = params.cursor
    ? buildCursorWhere(decodeCursor(params.cursor)!, direction)
    : undefined;

  // Fetch one extra row to tell whether there is a next page
  const rows = await db
    .select()
    .from(questions)
    .where(where)
    .orderBy(...orderBy)
    .limit(limit + 1);

  const hasNext = rows.length > limit;
  const page = hasNext ? rows.slice(0, limit) : rows;
  const last = page[page.length - 1];
  const nextCursor =
    hasNext && last
      ? encodeCursor({ createdAt: last.createdAt.getTime(), id: last.id })
      : null;

  return { items: page, nextCursor };
}
