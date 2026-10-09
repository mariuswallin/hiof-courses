// src/scheduled/overdueReminders.ts — the actual job.
//
// Finds tasks whose due date has passed and that are not completed, and mails
// the owner once. Run every morning by the cron trigger in wrangler.jsonc.
//
// Why a cron and not a request: nobody visits a page to be reminded that they
// forgot something. The whole point is that the work happens with no user
// present.
//
// The job is *idempotent*: run it twice and the second run mails nobody. That
// is a requirement, not a nicety — Cloudflare gives you an at-least-once
// guarantee, so a trigger can fire twice, and someone will inevitably hit
// /__scheduled by hand while testing. `tasks.reminder_sent_at` is what makes
// it hold: it is NULL until the mail goes out, and the query skips every row
// where it is set.
import { and, eq, inArray, isNull, lt, or } from "drizzle-orm";
import { db as productionDb, type DB } from "@/db";
import { tasks, users } from "@/db/schema";
import { mailer } from "@/lib/email";

/** How the mail reads. Kept here so the test can assert on it. */
export function buildReminderEmail(input: {
  to: string;
  name: string;
  taskName: string;
  dueDate: Date;
}) {
  const due = input.dueDate.toISOString().slice(0, 10);
  return {
    to: input.to,
    subject: `Oppgaven "${input.taskName}" har gått over fristen`,
    body:
      `Hei ${input.name}!\n\n` +
      `Oppgaven "${input.taskName}" hadde frist ${due} og er fortsatt ikke ` +
      `fullført.\n\nHilsen oppgavelista`,
  };
}

export type ReminderResult = {
  /** Tasks the query found. */
  found: number;
  /** Mails the provider accepted. */
  sent: number;
  /** Mails that failed. These keep reminder_sent_at NULL and are retried. */
  failed: number;
};

/**
 * Mail everyone with an overdue, unfinished task they have not been told
 * about yet.
 *
 * @param now  Injected so a test can decide what "overdue" means without
 *             touching the system clock.
 * @param db   Injected so the test can pass the in-memory SQLite client.
 *             Defaults to the D1 client, which is what the worker uses.
 */
export async function sendOverdueReminders(
  now: Date = new Date(),
  db: DB = productionDb as DB,
): Promise<ReminderResult> {
  // Join to users, because the mail needs an address and the task row only
  // has a user id.
  //
  // Note the `completed` filter. The column is `.default(false)` but NOT
  // `.notNull()`, so it is nullable, and `completed = 0` is false for a NULL
  // in SQL — three valued logic. Rows seeded before the default existed would
  // silently never be reminded about. `IS NULL OR = false` covers both.
  const overdue = await db
    .select({
      id: tasks.id,
      name: tasks.name,
      dueDate: tasks.dueDate,
      email: users.email,
      userName: users.name,
    })
    .from(tasks)
    .innerJoin(users, eq(tasks.userId, users.id))
    .where(
      and(
        lt(tasks.dueDate, now),
        or(isNull(tasks.completed), eq(tasks.completed, false)),
        isNull(tasks.reminderSentAt),
      ),
    );

  const sentIds: string[] = [];
  let failed = 0;

  for (const task of overdue) {
    const ok = await mailer.send(
      buildReminderEmail({
        to: task.email,
        name: task.userName,
        taskName: task.name,
        dueDate: task.dueDate,
      }),
    );

    // Only stamp the rows that actually went out. A failed send leaves
    // reminder_sent_at NULL, so tomorrow's run picks it up again.
    if (ok) sentIds.push(task.id);
    else failed += 1;
  }

  if (sentIds.length > 0) {
    // One UPDATE with IN (...) rather than one per row. Every statement is a
    // round trip to D1, and the loop above already costs one per mail.
    await db
      .update(tasks)
      .set({ reminderSentAt: now })
      .where(inArray(tasks.id, sentIds));
  }

  console.log(
    `[reminders] fant ${overdue.length}, sendte ${sentIds.length}, feilet ${failed}`,
  );

  return { found: overdue.length, sent: sentIds.length, failed };
}
