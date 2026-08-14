// src/app/components/LogoutButton.tsx
"use client";
import { useTransition } from "react";

export function LogoutButton() {
  const [isPending, start] = useTransition();
  function onClick() {
    start(async () => {
      await fetch("/api/auth/sign-out", {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/";
    });
  }
  return (
    <button
      onClick={onClick}
      disabled={isPending}
      className="text-sm text-muted hover:text-brand disabled:opacity-50"
    >
      {isPending ? "Logger ut..." : "Logg ut"}
    </button>
  );
}
