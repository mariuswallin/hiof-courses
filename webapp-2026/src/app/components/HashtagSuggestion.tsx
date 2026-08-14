// src/app/components/HashtagSuggestion.tsx — AI-suggested hashtags
"use client";
import { useState } from "react";

// The server returns an error kind (`kind`), not finished text. The wording
// belongs in the UI, where we know what the user can do about the error.
const ERROR_MESSAGES: Record<string, string> = {
  timeout: "KI-en brukte for lang tid.",
  "ai-failed": "Fikk ikke svar fra KI-en.",
  "empty-response": "KI-en svarte tomt.",
  "no-valid-tags": "Fant ingen brukbare hashtags. Prøv med litt mer tekst.",
  "ai-unavailable": "KI er ikke tilgjengelig her.",
};

function errorMessage(kind: string | undefined): string {
  return (kind && ERROR_MESSAGES[kind]) ?? "Noe gikk galt.";
}

export function HashtagSuggestion({ text }: { text: string }) {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchTags() {
    setLoading(true);
    setError(null);
    setTags([]);
    try {
      const resp = await fetch("/api/ai/hashtags", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = (await resp.json()) as { hashtags?: string[]; error?: string };
      if (!resp.ok) {
        setError(errorMessage(data.error));
        return;
      }
      setTags(data.hashtags ?? []);
    } catch {
      setError("Nettverksfeil. Sjekk at du er tilkoblet.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap text-sm">
      <button
        type="button"
        onClick={fetchTags}
        disabled={loading || text.trim().length === 0}
        className="text-brand hover:underline disabled:opacity-50"
      >
        {loading ? "Tenker..." : error ? "Prøv igjen" : "Foreslå hashtags"}
      </button>
      {error && (
        <span role="status" className="text-red-600">
          {error}
        </span>
      )}
      {tags.map((t) => (
        <span key={t} className="text-muted">
          #{t}
        </span>
      ))}
    </div>
  );
}
