// src/app/context/AuthProvider.tsx

"use client";

import {
  createContext,
  use,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { AuthUser } from "@/app/types/auth";

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
  initialUser?: AuthUser | null;
}

export function AuthProvider({
  children,
  initialUser = null,
}: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);

  // Login handler oppdaterer user state
  const login = useCallback((newUser: AuthUser) => {
    setUser(newUser);
  }, []);

  // The logout handler resets state and redirects
  const logout = useCallback(() => {
    setUser(null);
    // Redirect to the login page after logout
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    login,
    logout,
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextType {
  const context = use(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
