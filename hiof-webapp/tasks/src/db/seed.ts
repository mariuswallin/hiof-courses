// src/db/seed.ts

import { defineScript } from "rwsdk/worker";
import { drizzle } from "drizzle-orm/d1";
import { users, tasks, type Task } from "./schema";
import { createId } from "@/app/lib/id";

export default defineScript(async ({ env }) => {
  try {
    const db = drizzle(env.DB);
    await db.delete(users);

    const [userOne] = await db
      .insert(users)
      .values({
        name: "Test user",
        email: "test@testuser.io",
      })
      .returning();

    const [userTwo] = await db
      .insert(users)
      .values({
        name: "Jane Doe",
        email: "jane@doe.com",
      })
      .returning();

    const seedTasks: Task[] = [
      {
        id: createId(),
        name: "Task 1",
        description: "This is the first task",
        dueDate: new Date(Date.now() + 86400 * 1000),
        userId: userOne.id,
        completed: false,
      },
      {
        id: createId(),
        name: "Task 2",
        description: "This is the second task",
        dueDate: new Date(Date.now() + 172800 * 1000), // Due in 2 days
        userId: userOne.id,
        completed: false,
      },
      {
        id: createId(),
        name: "Task 3",
        description: "This is the third task",
        dueDate: new Date(Date.now() + 259200 * 1000), // Due in 3 days
        userId: userTwo.id,
        completed: false,
      },
    ];

    await db.insert(tasks).values(seedTasks);

    const createdUsers = await db.select().from(users).all();
    const createdTasks = await db.select().from(tasks).all();

    console.log("🌱 Seeded users:", createdUsers);
    console.log("🌱 Seeded tasks:", createdTasks);

    console.log("🌱 Finished seeding");

    return Response.json({
      success: true,
      users: createdUsers,
      tasks: createdTasks,
    });
  } catch (error) {
    console.error("Error seeding database:", error);
    return Response.json({
      success: false,
      error: "Failed to seed database",
    });
  }
});
