// src/app/components/AvatarUpload.tsx — avatar upload
"use client";
import { useState, useTransition } from "react";

interface Props {
  userId: string;
  currentAvatarUrl: string | null;
}

export function AvatarUpload({ userId, currentAvatarUrl }: Props) {
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Local preview before uploading to the server.
    setPreview(URL.createObjectURL(file));
    setError(null);
  }

  function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await fetch(`/api/users/${userId}/avatar`, {
        method: "POST",
        body: data, // fetch setter Content-Type (multipart) automatisk
        credentials: "include",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Opplasting feilet");
        return;
      }
      window.location.reload();
    });
  }

  return (
    <form onSubmit={handleUpload} className="flex flex-col gap-3">
      {preview && (
        <img
          src={preview}
          alt="Forhåndsvisning"
          className="h-24 w-24 rounded-full object-cover"
        />
      )}
      <input
        type="file"
        name="avatar"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-button bg-brand px-4 py-2 text-white disabled:opacity-50 w-fit"
      >
        {isPending ? "Laster opp..." : "Last opp"}
      </button>
    </form>
  );
}
