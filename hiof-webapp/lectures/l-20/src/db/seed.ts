// src/db/seed.ts

import {
  accounts,
  answers,
  questions,
  sessions,
  users,
  verifications,
} from "./schema";
import { defineScript } from "rwsdk/worker";
import { getDb, setupDb } from ".";
import { auth } from "@/auth/auth";

export default defineScript(async ({ env }) => {
  try {
    await setupDb(env.DB);
    const db = await getDb();

    // Children first, so no foreign key points at a deleted row
    await db.delete(answers);
    await db.delete(questions);
    await db.delete(sessions);
    await db.delete(accounts);
    await db.delete(verifications);
    await db.delete(users);

    // Users are created through better-auth, so the password is hashed and a
    // credential account is linked. The admin plugin's createUser can be
    // called from the server without headers, and it can set the role.
    // Log in with e-mail + password.
    const { user: admin } = await auth.api.createUser({
      body: {
        name: "Admin",
        email: "admin@example.com",
        password: "adminadmin",
        role: "admin",
      },
    });

    await auth.api.createUser({
      body: {
        name: "Test User",
        email: "test@example.com",
        password: "testtest",
        role: "user",
      },
    });

    // Create multiple test questions some with answers
    const [question1, question2, question3] = await db
      .insert(questions)
      .values([
        {
          question: "Hva er TypeScript?",
          authorId: admin.id,
          publishedAt: new Date(),
        },
        {
          question: "Hva er forskjellen på var, let og const?",
          authorId: admin.id,
          publishedAt: new Date(),
        },
        {
          question: "Hvordan har du det i dag?",
          authorId: admin.id,
        },
      ])
      .returning();

    // Create answers for questions
    await db.insert(answers).values([
      {
        answer: "Et superset av JavaScript med type safety",
        questionId: question1.id,
      },
      {
        answer: "Et nytt programmeringsspråk",
        questionId: question1.id,
      },
      {
        answer: "En måte å skrive mer robust kode på",
        questionId: question2.id,
      },
      {
        answer: "En ny måte å tenke på programmering",
        questionId: question2.id,
      },
      {
        answer: "En random svar",
        questionId: question2.id,
      },
      {
        answer: "Bra",
        questionId: question3.id,
      },
      {
        answer: "Fint",
        questionId: question3.id,
      },
    ]);

    console.log("🌱 Finished seeding");

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error("Error seeding database:", error);
    return Response.json({
      success: false,
      error: "Failed to seed database",
    });
  }
});
