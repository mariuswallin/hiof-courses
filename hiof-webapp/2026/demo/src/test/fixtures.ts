/**
 * Builds test data straight through Drizzle.
 *
 * The point: a test's setup must not depend on the code under test working.
 * Build the world with fixtures, and use the action or service only for the
 * thing the test is actually about.
 */
import { db, schema } from "@/test/db-mock";
import { setActor, clearActor, type TestUser } from "@/test/worker-mock";

let counter = 0;

/** Predictable ids per test. Call it in `beforeEach`. */
export function resetCounter(): void {
  counter = 0;
}

export async function makeUser(
  overrides: Partial<typeof schema.users.$inferInsert> = {}
) {
  counter++;
  const [user] = await db
    .insert(schema.users)
    .values({
      name: `Testbruker ${counter}`,
      email: `bruker${counter}@test.local`,
      ...overrides,
    })
    .returning();
  return user;
}

export async function makeTask(
  userId: number,
  overrides: Partial<typeof schema.tasks.$inferInsert> = {}
) {
  counter++;
  const [task] = await db
    .insert(schema.tasks)
    .values({
      id: `t${counter}`,
      name: `Task ${counter}`,
      description: `Beskrivelse ${counter}`,
      dueDate: new Date("2026-01-01T12:00:00Z"),
      userId,
      completed: false,
      published: true,
      // Seeded in creation order so list ordering is predictable per test.
      order: counter,
      ...overrides,
    })
    .returning();
  return task;
}

/** Sets the user on ctx, runs `fn`, and cleans up in `finally`. */
export async function runAs<T>(
  user: TestUser,
  fn: () => Promise<T> | T
): Promise<T> {
  setActor(user);
  try {
    return await fn();
  } finally {
    clearActor();
  }
}
