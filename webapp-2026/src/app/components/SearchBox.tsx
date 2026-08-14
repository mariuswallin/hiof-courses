// src/app/components/SearchBox.tsx — semantic search + RAG answer
"use client";
import { useState, useTransition } from "react";

type Source = { id: string; text: string; username: string | null; name: string };

export function SearchBox() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, start] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setAnswer(null);
    setSources([]);
    start(async () => {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        answer?: string;
        sources?: Source[];
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Søk feilet");
        return;
      }
      setAnswer(data.answer ?? "");
      setSources(data.sources ?? []);
    });
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Spør om noe — f.eks. «Hva skjer med været?»"
          className="flex-1 border rounded p-2 bg-transparent"
        />
        <button
          type="submit"
          disabled={isPending || query.trim().length === 0}
          className="bg-brand text-white px-4 rounded disabled:opacity-50"
        >
          {isPending ? "Søker..." : "Søk"}
        </button>
      </form>

      {error && <p className="text-red-600 text-sm">Feil: {error}</p>}

      {answer && (
        <div className="bg-surface border border-gray-200 dark:border-gray-700 rounded-card p-4">
          <p className="whitespace-pre-wrap">{answer}</p>
          {sources.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <p className="text-sm text-muted mb-1">Kilder</p>
              <ul className="space-y-1 text-sm">
                {sources.map((s) => (
                  <li key={s.id}>
                    <span className="font-semibold">@{s.username ?? s.name}</span>{" "}
                    {s.text}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
