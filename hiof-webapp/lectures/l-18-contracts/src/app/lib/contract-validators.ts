// src/app/lib/contract-validators.ts
//
// Helpers that enforce API contracts at runtime. Used on both sides:
// - Server, before the response is sent: `validateServerContract` (throws 500
//   on a breach)
// - Client, after the response is received: `validateClientContract` (throws
//   on a breach; the client must handle it gracefully)

import { z } from "zod";

export function validateServerContract<T>(data: unknown, schema: z.ZodType<T>): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error("[contract] server-side brudd:", result.error.flatten());
    throw new Error("Internal data format error — server brudd kontrakten sin");
  }
  return result.data;
}

export function validateClientContract<T>(response: unknown, schema: z.ZodType<T>): T {
  const result = schema.safeParse(response);
  if (!result.success) {
    console.warn(
      "[contract] klient mottok ugyldig server-respons:",
      result.error.flatten()
    );
    throw new Error("Server-respons matcher ikke forventet kontrakt");
  }
  return result.data;
}

/**
 * Softer variant — returns `null` on a breach instead of throwing.
 * Use it when you want to fall back to a default without interrupting the UI.
 */
export function tryClientContract<T>(
  response: unknown,
  schema: z.ZodType<T>
): T | null {
  const result = schema.safeParse(response);
  if (!result.success) {
    console.warn(
      "[contract] klient mottok ugyldig server-respons (myk):",
      result.error.flatten()
    );
    return null;
  }
  return result.data;
}
