// src/app/components/LoginForm.tsx
"use client";
import { useState, useTransition } from "react";
import { loginSchema, firstIssue } from "@/auth/schemas";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    // Quick client check — saves a network call on obviously invalid input.
    // Better Auth revalidates on the server regardless.
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(firstIssue(parsed.error));
      return;
    }

    startTransition(async () => {
      const res = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        setError(data.message ?? "Login feilet — sjekk e-post og passord");
        return;
      }
      window.location.href = "/";
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
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
        <span className="text-sm text-muted">Passord</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          minLength={12}
          className="w-full border rounded p-2 bg-transparent"
        />
      </label>
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-brand text-white p-2 rounded disabled:opacity-50"
      >
        {isPending ? "Logger inn..." : "Logg inn"}
      </button>
      {error && (
        <p role="alert" className="text-red-600 text-sm">
          {error}
        </p>
      )}
    </form>
  );
}
