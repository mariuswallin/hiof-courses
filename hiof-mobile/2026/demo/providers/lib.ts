// providers/lib.ts
//
// Shared error handling. Every provider call goes through asyncWrapper, so a
// thrown exception never escapes the provider layer.

import { AppwriteException } from "react-native-appwrite";
import { ZodError } from "zod";
import type { Failure, Result, Success } from "./types";

/** Turns anything thrown into a Failure with a message a user can read. */
export const handleError = (error: unknown): Failure => {
  if (error instanceof AppwriteException) {
    console.warn("Appwrite Error:", error.code, error.type, error.message);
    switch (error.code) {
      case 400:
        return { success: false, error: "Ugyldige data" };
      case 401:
        return { success: false, error: "Ikke tilgang" };
      case 404:
        return { success: false, error: "Ikke funnet" };
      case 409:
        return { success: false, error: "E-postadressen er allerede i bruk" };
      case 500:
        return { success: false, error: "Serverfeil" };
      default:
        return { success: false, error: error.message || "En ukjent feil oppstod" };
    }
  }

  if (error instanceof ZodError) {
    // The first issue is the one worth showing; the rest are usually noise for
    // a toast or an inline message.
    const first = error.issues[0];
    return { success: false, error: first?.message ?? "Ugyldige data" };
  }

  console.warn("Unknown Error:", error);
  return {
    success: false,
    error: error instanceof Error ? error.message : "En ukjent feil oppstod",
  };
};

export const handleResponse = <T>(response: T): Success<T> => ({
  success: true,
  data: response,
});

/** Runs an async operation and turns the outcome into a Result. */
export const asyncWrapper = async <T>(
  operation: () => Promise<T>,
): Promise<Result<T>> => {
  try {
    return handleResponse(await operation());
  } catch (error: unknown) {
    return handleError(error);
  }
};
