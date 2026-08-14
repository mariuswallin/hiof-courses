// src/app/pages/Login.tsx
import { LoginForm } from "@/app/components/LoginForm";

export function Login() {
  return (
    <div className="max-w-sm mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Logg inn</h1>
      <LoginForm />
      <p className="text-sm text-muted">
        Ny her?{" "}
        <a href="/register" className="text-brand hover:underline">
          Lag konto
        </a>
      </p>
    </div>
  );
}
