// types/index.ts
//
// Zod is the single source of truth for the shape of a task. The TypeScript
// types are inferred from the schemas, so they cannot drift apart.

import { z } from "zod";

// The field rules live here once and are reused by both schemas below, so the
// form and the stored row can never disagree about what is valid.
const nameField = z
  .string()
  .min(3, "Navnet må ha minst 3 tegn")
  .max(200, "Navnet kan ha maks 200 tegn");

const descriptionField = z
  .string()
  .max(1000, "Beskrivelsen kan ha maks 1000 tegn");

export const TaskSchema = z.object({
  id: z.string(),
  name: nameField,
  description: descriptionField.default(""),
  // z.coerce.date() because a date arrives as a string from both JSON and the
  // date picker. Without the coercion it would stay a string and break later.
  dueDate: z.coerce.date(),
  completed: z.boolean().default(false),
  // Position in the sortable list. Written by the reorder action.
  order: z.number().int().min(0).default(0),
  // Appwrite file id for the photo, or null when the task has none.
  imageId: z.string().nullable().default(null),
  userId: z.string(),
});

// What the form collects. The server owns id, order and userId.
export const TaskInputSchema = TaskSchema.omit({
  id: true,
  order: true,
  userId: true,
});

export const TaskPatchSchema = TaskInputSchema.partial();

/**
 * What the form validates.
 *
 * Separate from TaskInputSchema because `.default()` makes a field optional on
 * the way in, and TanStack Form needs the validated shape to match the values
 * it holds. The rules are the same objects, so they cannot drift.
 */
export const TaskFormSchema = z.object({
  name: nameField,
  description: descriptionField,
  dueDate: z.date(),
  completed: z.boolean(),
});

export type Task = z.infer<typeof TaskSchema>;
export type TaskFormValues = z.infer<typeof TaskFormSchema>;
export type TaskInput = z.infer<typeof TaskInputSchema>;
export type TaskPatch = z.infer<typeof TaskPatchSchema>;

export const CredentialsSchema = z.object({
  email: z.email("Ugyldig e-postadresse"),
  password: z.string().min(8, "Passordet må ha minst 8 tegn"),
});

export const RegisterSchema = CredentialsSchema.extend({
  name: z.string().min(2, "Navnet må ha minst 2 tegn"),
});

export type Credentials = z.infer<typeof CredentialsSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;

export type User = {
  id: string;
  name: string;
  email: string;
};
