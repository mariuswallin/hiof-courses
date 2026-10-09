// context/AuthProvider.tsx
//
// Holds the signed in user and exposes login, register and logout.
//
// React 19 note: the context object is rendered directly as <AuthContext>,
// not <AuthContext.Provider>, and it is read with use() rather than
// useContext(). Both are React 19 features. Lecture l-30 still uses the older
// form in places; this is the current way.

import { createContext, use, useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { backend } from "@/providers";
import type { Credentials, RegisterInput, User } from "@/types";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (input: Credentials) => Promise<boolean>;
  register: (input: RegisterInput) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Restore the session on start. A missing session is not an error, so the
  // provider returns null rather than failing.
  useEffect(() => {
    let active = true;
    backend.auth.currentUser().then((result) => {
      if (!active) return;
      if (result.success) setUser(result.data);
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (input: Credentials) => {
    setError(null);
    const result = await backend.auth.login(input);
    if (!result.success) {
      setError(result.error);
      return false;
    }
    setUser(result.data);
    return true;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    setError(null);
    const result = await backend.auth.register(input);
    if (!result.success) {
      setError(result.error);
      return false;
    }
    setUser(result.data);
    return true;
  }, []);

  const logout = useCallback(async () => {
    await backend.auth.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext value={{ user, isLoading, error, login, register, logout }}>
      {children}
    </AuthContext>
  );
}

/** Reads the auth context. Throws a clear error if the provider is missing. */
export function useAuth() {
  const context = use(AuthContext);
  if (!context) {
    throw new Error("useAuth må brukes inne i en AuthProvider");
  }
  return context;
}
