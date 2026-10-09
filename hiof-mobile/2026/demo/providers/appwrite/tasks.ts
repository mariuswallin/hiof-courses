// providers/appwrite/tasks.ts

import { ID, Query } from "react-native-appwrite";
import { tablesDB } from "./client";
import { asyncWrapper } from "../lib";
import type { TasksProviderApi } from "../contract";
import { APPWRITE_KEYS } from "@/constants/keys";
import { TaskSchema, TaskInputSchema, TaskPatchSchema, type Task } from "@/types";

const { DATABASE_ID, TASKS_TABLE_ID } = APPWRITE_KEYS;

/** Appwrite rows carry $id and $-prefixed metadata; the app wants a clean Task. */
function toTask(row: Record<string, unknown>): Task {
  return TaskSchema.parse({
    id: row.$id,
    name: row.name,
    description: row.description ?? "",
    dueDate: row.dueDate,
    completed: row.completed ?? false,
    order: row.order ?? 0,
    imageId: row.imageId ?? null,
    userId: row.userId,
  });
}

const ids = () => ({
  databaseId: DATABASE_ID ?? "",
  tableId: TASKS_TABLE_ID ?? "",
});

export const appwriteTasks: TasksProviderApi = {
  async list(userId) {
    return asyncWrapper(async () => {
      const response = await tablesDB.listRows({
        ...ids(),
        // Each user only ever sees their own rows. The same filter must exist
        // as a permission rule in Appwrite; this query is convenience, not
        // security.
        queries: [Query.equal("userId", userId), Query.orderAsc("order")],
      });
      return response.rows.map(toTask);
    });
  },

  async getById(id) {
    return asyncWrapper(async () => {
      const row = await tablesDB.getRow({ ...ids(), rowId: id });
      return toTask(row);
    });
  },

  async create(userId, input) {
    return asyncWrapper(async () => {
      const parsed = TaskInputSchema.parse(input);

      // New tasks go last. MAX + 1 rather than COUNT, because the two diverge
      // as soon as a row is deleted: remove the middle of 0, 1, 2 and the count
      // is 2 while 2 is still taken.
      const existing = await tablesDB.listRows({
        ...ids(),
        queries: [
          Query.equal("userId", userId),
          Query.orderDesc("order"),
          Query.limit(1),
        ],
      });
      const highest = existing.rows[0]?.order;
      const nextOrder = typeof highest === "number" ? highest + 1 : 0;

      const row = await tablesDB.createRow({
        ...ids(),
        rowId: ID.unique(),
        data: {
          name: parsed.name,
          description: parsed.description,
          dueDate: parsed.dueDate.toISOString(),
          completed: parsed.completed,
          imageId: parsed.imageId,
          order: nextOrder,
          userId,
        },
      });
      return toTask(row);
    });
  },

  async update(id, patch) {
    return asyncWrapper(async () => {
      const parsed = TaskPatchSchema.parse(patch);
      // Only send the keys that are actually present, so a patch never
      // overwrites a column with undefined.
      const data: Record<string, unknown> = {};
      if (parsed.name !== undefined) data.name = parsed.name;
      if (parsed.description !== undefined) data.description = parsed.description;
      if (parsed.dueDate !== undefined) data.dueDate = parsed.dueDate.toISOString();
      if (parsed.completed !== undefined) data.completed = parsed.completed;
      if (parsed.imageId !== undefined) data.imageId = parsed.imageId;

      const row = await tablesDB.updateRow({ ...ids(), rowId: id, data });
      return toTask(row);
    });
  },

  async remove(id) {
    return asyncWrapper(async () => {
      const row = await tablesDB.getRow({ ...ids(), rowId: id });
      await tablesDB.deleteRow({ ...ids(), rowId: id });
      return toTask(row);
    });
  },

  async reorder(orderedIds) {
    return asyncWrapper(async () => {
      // One update per row, same dense 0..n-1 positions as the webapp demo.
      //
      // Performance: unlike the webapp, where every write hits a local SQLite,
      // each of these is an HTTP round trip. Fine for a list you can see on one
      // screen, slow on a long one over a poor connection. Fractional ranks,
      // where the moved row gets a position between its neighbours, are the
      // answer if the list grows.
      const updated = [];
      for (const [index, id] of orderedIds.entries()) {
        const row = await tablesDB.updateRow({
          ...ids(),
          rowId: id,
          data: { order: index },
        });
        updated.push(toTask(row));
      }
      return updated;
    });
  },
};
