// src/features/auth/actions/auth.ts
"use server";

import { z } from "zod";
import { requestInfo } from "rwsdk/worker";

import { auth } from "@/auth/auth";

export type AuthState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

const loginSchema = z.object({
  email: z.string().email("Ugyldig e-postadresse"),
  password: z.string().min(8, "Minst 8 tegn"),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(1, "Navn er påkrevd"),
});

/**
 * better-auth does not set cookies on our response itself. With
 * `returnHeaders: true` we get the Set-Cookie headers back, and have to copy
 * them onto the response going to the browser.
 */
function applyAuthHeaders(headers: Headers) {
  const { response } = requestInfo;
  for (const [key, value] of headers.entries()) {
    response.headers.append(key, value);
  }
}

function toFieldErrors(error: z.ZodError) {
  return Object.fromEntries(
    error.issues.map((i) => [String(i.path[0] ?? "_"), i.message])
  );
}

export async function login(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: toFieldErrors(parsed.error) };
  }

  const { request, response } = requestInfo;

  try {
    const { headers } = await auth.api.signInEmail({
      body: parsed.data,
      headers: request.headers,
      returnHeaders: true,
    });
    applyAuthHeaders(headers);
    response.headers.set("Location", "/");
    return { ok: true };
  } catch {
    return { ok: false, error: "Ugyldig e-post eller passord" };
  }
}

export async function register(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: toFieldErrors(parsed.error) };
  }

  const { request, response } = requestInfo;

  try {
    const { headers } = await auth.api.signUpEmail({
      body: parsed.data,
      headers: request.headers,
      returnHeaders: true,
    });
    applyAuthHeaders(headers);
    response.headers.set("Location", "/");
    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Registrering feilet";
    return { ok: false, error: message };
  }
}

export async function logout() {
  const { request, response } = requestInfo;
  const { headers } = await auth.api.signOut({
    headers: request.headers,
    returnHeaders: true,
  });
  applyAuthHeaders(headers); // Set-Cookie that clears the session
  response.headers.set("Location", "/login");
}
