// src/db/seed.ts

import { answers, questions, users } from "./schema";
import { defineScript } from "rwsdk/worker";
import { getDb, setupDb } from ".";

export default defineScript(async ({ env }) => {
  try {
    await setupDb(env.DB);
    const db = await getDb();
    await db.delete(users);
    await db.delete(questions);
    await db.delete(answers);

    // Create test user
    const [admin] = await db
      .insert(users)
      .values({
        username: "admin",
        email: "admin@example.com",
        role: "admin",
        passwordHash: "adminadmin",
      })
      .returning();

    const [student] = await db
      .insert(users)
      .values({
        username: "student",
        email: "student@example.com",
        role: "user",
        passwordHash: "studentstudent",
      })
      .returning();

    const [studentTwo] = await db
      .insert(users)
      .values({
        username: "student2",
        email: "student2@example.com",
        role: "user",
        passwordHash: "student2student2",
      })
      .returning();

    // Create multiple test questions some with answers
    const [question1, question2, question3] = await db
      .insert(questions)
      .values([
        {
          question: "Hva er TypeScript?",
          authorId: admin.id,
          publishedAt: new Date(),
          status: "published",
        },
        {
          question: "Hva er forskjellen på var, let og const?",
          authorId: admin.id,
          publishedAt: new Date(),
          status: "published",
        },
        {
          question: "Hvordan har du det i dag?",
          authorId: admin.id,
          status: "draft",
        },
      ])
      .returning();

    // Create answers for questions
    await db.insert(answers).values([
      {
        answer: "Et superset av JavaScript med type safety",
        questionId: question1.id,
        authorId: student.id,
      },
      {
        answer: "Et nytt programmeringsspråk",
        questionId: question1.id,
        authorId: studentTwo.id,
      },
      {
        answer: "En måte å skrive mer robust kode på",
        questionId: question2.id,
        authorId: student.id,
      },
      {
        answer: "En ny måte å tenke på programmering",
        questionId: question2.id,
        authorId: studentTwo.id,
      },
      {
        answer: "En random svar",
        questionId: question2.id,
        authorId: student.id,
      },
      {
        answer: "Bra",
        questionId: question3.id,
        authorId: student.id,
      },
      {
        answer: "Fint",
        questionId: question3.id,
        authorId: studentTwo.id,
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
