// src/scheduled/index.ts — cron dispatcher.
//
// Every cron expression in `wrangler.jsonc` fires the SAME `scheduled`
// handler. We discriminate on `event.cron` to know which trigger ran. The
// expressions here must match `triggers.crons` in wrangler.jsonc.
import { runNightlyCleanup } from "./cleanup";
import { computeTrendingPosts } from "./trending";

export const CRON_NIGHTLY_CLEANUP = "0 3 * * *"; // every night 03:00 UTC
export const CRON_TRENDING = "0 */4 * * *"; // every 4 hours

export async function scheduled(
  event: ScheduledEvent,
  _env: unknown,
  ctx: ExecutionContext,
): Promise<void> {
  switch (event.cron) {
    case CRON_NIGHTLY_CLEANUP:
      // waitUntil keeps the worker alive until the job finishes, even if the
      // handler returns first.
      ctx.waitUntil(runNightlyCleanup());
      break;

    case CRON_TRENDING:
      ctx.waitUntil(computeTrendingPosts());
      break;

    default:
      console.warn(`[scheduled] Ukjent cron-uttrykk: ${event.cron}`);
  }
}

export { runNightlyCleanup, cleanupSoftDeleted, cleanupOrphanedImages } from "./cleanup";
export { computeTrendingPosts } from "./trending";
