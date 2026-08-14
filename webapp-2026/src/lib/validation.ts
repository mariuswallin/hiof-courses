// src/lib/validation.ts

export type ValidationResult = { ok: true } | { ok: false; error: string };

const POST_MAX = 280;
const USERNAME_MIN = 3;
const USERNAME_MAX = 20;
const USERNAME_PATTERN = /^[a-z0-9_]+$/i;
const RESERVED_USERNAMES = new Set(["admin", "root", "system", "kvitter"]);

export function validatePost(text: string): ValidationResult {
  if (text.length === 0) {
    return { ok: false, error: "Innlegg kan ikke være tomt" };
  }
  if (text.trim().length === 0) {
    return { ok: false, error: "Innlegg kan ikke være bare whitespace" };
  }
  if (text.length > POST_MAX) {
    return { ok: false, error: `Innlegg er for langt (maks ${POST_MAX} tegn)` };
  }
  return { ok: true };
}

export function validateUsername(name: string): ValidationResult {
  if (name.length < USERNAME_MIN) {
    return { ok: false, error: `Brukernavn må være minst ${USERNAME_MIN} tegn` };
  }
  if (name.length > USERNAME_MAX) {
    return { ok: false, error: `Brukernavn kan være maks ${USERNAME_MAX} tegn` };
  }
  if (!USERNAME_PATTERN.test(name)) {
    return { ok: false, error: "Brukernavn kan kun inneholde a-z, 0-9 og _" };
  }
  if (RESERVED_USERNAMES.has(name.toLowerCase())) {
    return { ok: false, error: "Brukernavn er reservert" };
  }
  return { ok: true };
}
