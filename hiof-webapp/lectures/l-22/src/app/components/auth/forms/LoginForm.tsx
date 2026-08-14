// src/app/components/auth/forms/LoginForm.tsx

"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { login } from "@/app/api/auth/authServerActions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? "Logger inn..." : "Logg inn"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(
    async (prevState: any, formData: FormData) => {
      const result = await login(prevState, formData);

      if (result.success) {
        window.location.href = "/";
      }
      return result;
    },
    {
      success: false,
      error: "",
      state: {
        user: null,
        session: null,
      },
    }
  );

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Logg inn</h1>
        <p>{JSON.stringify(state)}</p>

        {!state.success && state.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            <p className="text-sm">{state.error}</p>
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Brukernavn
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              autoComplete="username"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Skriv inn brukernavn"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Passord
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Skriv inn passord"
            />
          </div>

          <SubmitButton />
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Har du ikke konto?{" "}
            <a
              href="/auth/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Registrer deg her
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
