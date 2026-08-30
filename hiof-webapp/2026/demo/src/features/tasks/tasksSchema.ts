import { z } from "zod";

/**
 * Zod schemas for everything that arrives from outside the app.
 *
 * The important one is `dueDate`. JSON has no date type, so a request body
 * carries it as a string. Drizzle's timestamp column expects a real Date and
 * calls `.getTime()` on whatever it is handed, so an unparsed string fails at
 * the driver with "value.getTime is not a function". `z.coerce.date()` turns
 * the string into a Date at the edge, which is where the conversion belongs.
 *
 * The name rules mirror the HTML attributes on the form in
 * ./components/TaskEditAction.tsx, so the browser and the server agree on what
 * is valid.
 */

export const createTaskSchema = z.object({
  name: z.string().min(3).max(200),
  description: z.string().min(1).max(1000),
  dueDate: z.coerce.date().optional(),
  userId: z.number().int().positive(),
  completed: z.boolean().optional(),
  published: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

// Every field optional, because a PATCH may carry only the ones that change.
// The empty case is rejected later by the service, which owns that rule.
export const updateTaskSchema = createTaskSchema.partial();

export const reorderSchema = z.array(z.string().min(1)).min(1);

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

/**
 * Turns a Zod error into a plain field to messages map, which is what the
 * `validationErrors` field on `ServerResultError` expects.
 */
export function toValidationErrors(
  error: z.ZodError
): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    errors[key] ??= [];
    errors[key].push(issue.message);
  }

  return errors;
}
