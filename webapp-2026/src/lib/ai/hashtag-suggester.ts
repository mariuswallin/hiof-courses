// src/lib/ai/hashtag-suggester.ts
import { ok, err, type Result } from "@/lib/result";

// Primary model + fallback. Workers AI can answer with a capacity error or
// 5xx for a single model while the rest of the platform is healthy. Trying
// the next model is then cheaper than showing the user an error.
//
// Note: the model ID must match the catalog exactly (`wrangler ai models`).
// The catalog changes: `@cf/meta/llama-3.1-8b-instruct` was replaced by the
// `-fp8` variant, and a call to the old name fails every time.
const MODELS = [
  "@cf/meta/llama-3.1-8b-instruct-fp8",
  "@cf/meta/llama-4-scout-17b-16e-instruct",
] as const;

const TEMPERATURE = 0.3;
const SYSTEM_PROMPT =
  "Du foreslår norske hashtags for sosiale medier. " +
  "Returnér nøyaktig 3 ord, små bokstaver, separert med komma. " +
  "Ingen #, ingen forklaring, ingen punktum.";

export type HashtagError =
  | { kind: "timeout" }
  | { kind: "ai-failed"; cause: unknown }
  | { kind: "empty-response" }
  | { kind: "no-valid-tags"; raw: string };

type AiBinding = {
  run: (
    model: string,
    input: Record<string, unknown>,
    options?: { signal?: AbortSignal },
  ) => Promise<{ response?: string }>;
};

export function parseHashtagResponse(raw: string): string[] {
  return raw
    .toLowerCase()
    .replaceAll("#", "")
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && /^[a-zæøå0-9_]+$/i.test(s))
    .slice(0, 3);
}

// AbortController throws a DOMException named "AbortError", not a plain
// Error. So check the name, not the type.
function isAbortError(cause: unknown): boolean {
  return (
    typeof cause === "object" &&
    cause !== null &&
    (cause as { name?: unknown }).name === "AbortError"
  );
}

export async function suggestHashtags(
  text: string,
  AI: AiBinding,
  opts: { signal?: AbortSignal } = {},
): Promise<Result<string[], HashtagError>> {
  let lastCause: unknown = null;

  for (const model of MODELS) {
    try {
      const resp = await AI.run(
        model,
        {
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: text },
          ],
          temperature: TEMPERATURE,
        },
        { signal: opts.signal },
      );

      if (!resp.response?.trim()) {
        return err({ kind: "empty-response" });
      }
      const tags = parseHashtagResponse(resp.response);
      if (tags.length === 0) {
        return err({ kind: "no-valid-tags", raw: resp.response });
      }
      return ok(tags);
    } catch (cause) {
      // The deadline covers the whole request. Once it is spent, trying the next
      // model does not help — the user just waits longer for the same error.
      if (isAbortError(cause) || opts.signal?.aborted) {
        return err({ kind: "timeout" });
      }
      lastCause = cause;
    }
  }

  return err({ kind: "ai-failed", cause: lastCause });
}
