// src/app/components/NewPostForm.tsx
"use client";
import { useState, useTransition } from "react";
import { createPost } from "@/actions/posts";
import { HashtagSuggestion } from "@/app/components/HashtagSuggestion";

export function NewPostForm() {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createPost(text);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setText("");
      // The feed is server-rendered; refetch it to show the new post.
      window.location.reload();
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="bg-surface border border-gray-200 dark:border-gray-700 rounded-card p-4 grid gap-2"
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        maxLength={280}
        placeholder="Hva tenker du på?"
        className="w-full bg-transparent resize-none outline-none"
      />
      <HashtagSuggestion text={text} />
      <div className="flex items-center justify-between">
        <small className="text-muted">{text.length} / 280</small>
        <button
          type="submit"
          disabled={isPending || text.trim().length === 0}
          className="bg-brand text-white px-4 py-1.5 rounded-button text-sm disabled:opacity-50"
        >
          {isPending ? "Sender..." : "Post"}
        </button>
      </div>
      {error && (
        <p role="alert" className="text-red-600 text-sm">
          {error}
        </p>
      )}
    </form>
  );
}
