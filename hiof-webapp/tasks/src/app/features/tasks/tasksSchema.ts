import z from "zod";

export const TaskSchema = z.object({
  id: z.string(),
  name: z.string().min(3, "Task name must be at least 3 characters").max(200),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000),
  dueDate: z.coerce.date().refine((date) => date > new Date(), {
    message: "Due date must be in the future",
  }),
  userId: z.number().positive(),
  completed: z.boolean(),
});

// TODO: Her bør vi ha flere schema
