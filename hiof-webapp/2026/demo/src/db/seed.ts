// src/db/seed.ts
//
// Run with:
//   pnpm seed            Mac, Linux, Git Bash
//   pnpm seed:windows    PowerShell or cmd, see scripts/run-seed-windows.mjs
//
// POST /api/seed in src/worker.tsx does the same from the browser.
//
// `env` is optional so the same function works both from `defineScript`,
// which passes the bindings in, and from the route, which reads them from
// `cloudflare:workers`.

import { defineScript } from "rwsdk/worker";
import { drizzle } from "drizzle-orm/d1";
import { users, type Task, tasks } from "./schema";
import { env as WorkerEnv } from "cloudflare:workers";

export const seedData = async (env?: Env) => {
  try {
    const db = drizzle(env?.DB ?? WorkerEnv.DB);
    await db.delete(users);
    await db.delete(tasks);

    const [user1] = await db
      .insert(users)
      .values({
        name: "Test user",
        email: "test@testuser.io",
      })
      .returning();

    const taskData: Task[] = [
      {
        id: "1",
        name: "Task 1",
        description: "Description for Task 1",
        dueDate: new Date(Date.now() + 86400 * 1000),
        userId: user1.id,
        completed: false,
        published: true,
        order: 0,
        reminderSentAt: null,
      },
      {
        id: "2",
        name: "Task 2",
        description: "Description for Task 2",
        dueDate: new Date(Date.now() + 172800 * 1000), // Due in 2 days
        userId: user1.id,
        completed: false,
        published: false,
        order: 1,
        reminderSentAt: null,
      },
      {
        // Deliberately overdue and unfinished, so the cron job in
        // src/scheduled/ has something to find right after a seed. See
        // "Cron" in README.md.
        id: "3",
        name: "Task 3",
        description: "Over fristen, ikke fullfort",
        dueDate: new Date(Date.now() - 172800 * 1000), // Two days ago
        userId: user1.id,
        completed: false,
        published: true,
        order: 2,
        reminderSentAt: null,
      },
    ];

    const [...insertedTasks] = await db
      .insert(tasks)
      .values(taskData)
      .returning();

    const result = await db.select().from(users).all();
    console.log("Inserted tasks:", insertedTasks);

    console.log("🌱 Finished seeding");

    return result;
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
};

export default defineScript(async ({ env }) => {
  try {
    await seedData(env);
    return Response.json(true);
  } catch (error) {
    console.error("Error seeding database:", error);
    return Response.json({
      success: false,
      error: "Failed to seed database",
    });
  }
});
