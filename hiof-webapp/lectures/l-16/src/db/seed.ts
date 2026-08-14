// src/db/seed.ts

import { answers, questions, users } from "./schema";
import { defineScript } from "rwsdk/worker";
import { db } from ".";

export default defineScript(async () => {
  try {
    await db.delete(users);
    await db.delete(questions);
    await db.delete(answers);

    // Create test user
    const [user] = await db
      .insert(users)
      .values({
        name: "Test User",
        email: "test@example.com",
      })
      .returning();

    // Create multiple test questions some with answers
    const [question1, question2, question3] = await db
      .insert(questions)
      .values([
        {
          question: "Hva er TypeScript?",
          authorId: user.id,
          publishedAt: new Date(),
        },
        {
          question: "Hva er forskjellen på var, let og const?",
          authorId: user.id,
          publishedAt: new Date(),
        },
        {
          question: "Hvordan har du det i dag?",
          authorId: user.id,
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
