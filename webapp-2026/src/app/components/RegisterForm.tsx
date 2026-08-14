// src/app/components/RegisterForm.tsx
"use client";
import { useState, useTransition } from "react";
import { registerSchema, firstIssue } from "@/auth/schemas";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, start] = useTransition();

  function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    // Same schema the server expects — the error shows at the field right away
    // instead of after a round trip.
    const parsed = registerSchema.safeParse({ name, email, password });
    if (!parsed.success) {
      setError(firstIssue(parsed.error));
      return;
    }

    start(async () => {
      const res = await fetch("/api/auth/sign-up/email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        setError(data.message ?? "Registrering feilet");
        return;
      }
      window.location.href = "/";
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block">
        <span className="text-sm text-muted">Navn</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
          className="w-full border rounded p-2 bg-transparent"
        />
      </label>
      <label className="block">
        <span className="text-sm text-muted">E-post</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="w-full border rounded p-2 bg-transparent"
        />
      </label>
      <label className="block">
        <span className="text-sm text-muted">Passord (min 12 tegn)</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={12}
          autoComplete="new-password"
          className="w-full border rounded p-2 bg-transparent"
        />
      </label>
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-brand text-white p-2 rounded disabled:opacity-50"
      >
        {isPending ? "Oppretter..." : "Lag konto"}
      </button>
      {error && (
        <p role="alert" className="text-red-600 text-sm">
          {error}
        </p>
      )}
    </form>
  );
}
