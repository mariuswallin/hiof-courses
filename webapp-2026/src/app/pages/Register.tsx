// src/app/pages/Register.tsx
import { RegisterForm } from "@/app/components/RegisterForm";

export function Register() {
  return (
    <div className="max-w-sm mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Lag konto</h1>
      <RegisterForm />
      <p className="text-sm text-muted">
        Har du konto?{" "}
        <a href="/login" className="text-brand hover:underline">
          Logg inn
        </a>
      </p>
    </div>
  );
}
