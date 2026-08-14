// app/lib/schema/pagination.ts

import { z } from "zod";

export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(500).default(100),
});
