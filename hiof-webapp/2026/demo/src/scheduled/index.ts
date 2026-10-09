// src/scheduled/index.ts — the cron dispatcher.
//
// A Worker has more entry points than `fetch`. `scheduled` is the one
// Cloudflare calls on a timer, with no request and no user in sight. It is
// exported next to `fetch` from src/worker.tsx:
//
//   export default { fetch: app.fetch, scheduled };
//
// EVERY cron expression in `wrangler.jsonc` fires this same handler, so the
// only way to tell them apart is `event.cron`. The strings below must match
// `triggers.crons` in wrangler.jsonc character for character — a stray space
// means the job silently never runs, and you get a warning in `wrangler tail`
// instead of an error.
import { sendOverdueReminders } from "./overdueReminders";

/** Every day at 07:00 UTC. Cron triggers are always UTC, never local time. */
export const CRON_OVERDUE_REMINDERS = "0 7 * * *";

export async function scheduled(
  event: ScheduledEvent,
  _env: unknown,
  ctx: ExecutionContext,
): Promise<void> {
  switch (event.cron) {
    case CRON_OVERDUE_REMINDERS:
      // waitUntil keeps the worker alive until the promise settles, even
      // though the handler itself returns immediately. Without it the runtime
      // may tear the invocation down mid-mail.
      ctx.waitUntil(sendOverdueReminders(new Date(event.scheduledTime)));
      break;

    default:
      console.warn(`[scheduled] Ukjent cron-uttrykk: ${event.cron}`);
  }
}

export { sendOverdueReminders, buildReminderEmail } from "./overdueReminders";
