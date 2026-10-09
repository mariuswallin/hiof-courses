/**
 * Integration test of the cron job.
 *
 * The job is an ordinary function over `db`, so it uses exactly the same three
 * mocks as the service and action tests. That is the whole point of letting
 * `scheduled` do nothing but call a function: you need no Workers runtime, no
 * frozen clock and no mail provider to test the behaviour.
 *
 * What matters most here is *idempotency*: run the job twice and the second
 * run must send nothing. Cloudflare guarantees a trigger fires at least once,
 * not exactly once.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/db", () => import("@/test/db-mock"));
vi.mock("rwsdk/worker", () => import("@/test/worker-mock"));
vi.mock("cloudflare:workers", () => import("@/test/env-mock"));

import { eq } from "drizzle-orm";
import { db, schema, resetDb } from "@/test/db-mock";
import { makeUser, makeTask, resetCounter } from "@/test/fixtures";
import {
  sendOverdueReminders,
  buildReminderEmail,
} from "@/scheduled/overdueReminders";
import { mailer } from "@/lib/email";
import type { DB } from "@/db";

// The in-memory client stands in for D1. Same Drizzle API, other driver.
const testDb = db as unknown as DB;

const NOW = new Date("2026-03-01T07:00:00Z");
const daysBefore = (days: number) =>
  new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000);
const daysAfter = (days: number) =>
  new Date(NOW.getTime() + days * 24 * 60 * 60 * 1000);

/** Spy on the sender, so no test depends on what `mailer.send` does inside. */
function spyOnMailer(result = true) {
  return vi.spyOn(mailer, "send").mockResolvedValue(result);
}

describe("cron · sendOverdueReminders", () => {
  beforeEach(() => {
    resetDb();
    resetCounter();
    vi.restoreAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("mails the owner about a task that is past its due date", async () => {
    const send = spyOnMailer();
    const user = await makeUser({ name: "Kari", email: "kari@test.local" });
    await makeTask(user.id, {
      name: "Levere oblig",
      dueDate: daysBefore(2),
      completed: false,
    });

    const result = await sendOverdueReminders(NOW, testDb);

    expect(result).toEqual({ found: 1, sent: 1, failed: 0 });
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toMatchObject({
      to: "kari@test.local",
      subject: 'Oppgaven "Levere oblig" har gått over fristen',
    });
  });

  it("leaves tasks that still have time alone", async () => {
    const send = spyOnMailer();
    const user = await makeUser();
    await makeTask(user.id, { dueDate: daysAfter(3), completed: false });

    const result = await sendOverdueReminders(NOW, testDb);

    expect(result.found).toBe(0);
    expect(send).not.toHaveBeenCalled();
  });

  it("leaves completed tasks alone", async () => {
    const send = spyOnMailer();
    const user = await makeUser();
    await makeTask(user.id, { dueDate: daysBefore(5), completed: true });

    const result = await sendOverdueReminders(NOW, testDb);

    expect(result.found).toBe(0);
    expect(send).not.toHaveBeenCalled();
  });

  it("includes tasks where completed is NULL", async () => {
    // `completed` has a default of false but is not NOT NULL. In SQL
    // `completed = 0` is *not* true for NULL, so a row without a value would
    // be skipped if the query only checked = false.
    const send = spyOnMailer();
    const user = await makeUser();
    const task = await makeTask(user.id, { dueDate: daysBefore(1) });
    await db
      .update(schema.tasks)
      .set({ completed: null })
      .where(eq(schema.tasks.id, task.id));

    const result = await sendOverdueReminders(NOW, testDb);

    expect(result.sent).toBe(1);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("is idempotent — the second run sends nothing", async () => {
    const send = spyOnMailer();
    const user = await makeUser();
    await makeTask(user.id, { dueDate: daysBefore(2), completed: false });

    expect((await sendOverdueReminders(NOW, testDb)).sent).toBe(1);
    expect((await sendOverdueReminders(NOW, testDb)).sent).toBe(0);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("stamps reminder_sent_at on the rows that were actually sent", async () => {
    spyOnMailer();
    const user = await makeUser();
    await makeTask(user.id, { dueDate: daysBefore(2), completed: false });

    await sendOverdueReminders(NOW, testDb);

    const [task] = await db.select().from(schema.tasks);
    expect(task.reminderSentAt).toEqual(NOW);
  });

  it("leaves reminder_sent_at empty when sending fails, so it is retried", async () => {
    const send = spyOnMailer(false);
    const user = await makeUser();
    await makeTask(user.id, { dueDate: daysBefore(2), completed: false });

    const first = await sendOverdueReminders(NOW, testDb);

    expect(first).toEqual({ found: 1, sent: 0, failed: 1 });
    const [task] = await db.select().from(schema.tasks);
    expect(task.reminderSentAt).toBeNull();

    // The next run, this time with a provider that answers.
    send.mockResolvedValue(true);
    expect((await sendOverdueReminders(NOW, testDb)).sent).toBe(1);
  });

  it("sends one mail per task, to the right owner", async () => {
    const send = spyOnMailer();
    const kari = await makeUser({ name: "Kari", email: "kari@test.local" });
    const ola = await makeUser({ name: "Ola", email: "ola@test.local" });
    await makeTask(kari.id, { dueDate: daysBefore(1), completed: false });
    await makeTask(kari.id, { dueDate: daysBefore(4), completed: false });
    await makeTask(ola.id, { dueDate: daysBefore(2), completed: false });

    const result = await sendOverdueReminders(NOW, testDb);

    expect(result.sent).toBe(3);
    const recipients = send.mock.calls.map(([message]) => message.to).sort();
    expect(recipients).toEqual([
      "kari@test.local",
      "kari@test.local",
      "ola@test.local",
    ]);
  });

  it("does nothing against an empty database", async () => {
    const send = spyOnMailer();

    const result = await sendOverdueReminders(NOW, testDb);

    expect(result).toEqual({ found: 0, sent: 0, failed: 0 });
    expect(send).not.toHaveBeenCalled();
  });
});

describe("cron · buildReminderEmail", () => {
  it("puts the recipient, the subject and the due date in the message", () => {
    const message = buildReminderEmail({
      to: "kari@test.local",
      name: "Kari",
      taskName: "Levere oblig",
      dueDate: new Date("2026-02-27T23:59:00Z"),
    });

    expect(message.to).toBe("kari@test.local");
    expect(message.subject).toContain("Levere oblig");
    expect(message.body).toContain("Hei Kari!");
    expect(message.body).toContain("2026-02-27");
  });
});
