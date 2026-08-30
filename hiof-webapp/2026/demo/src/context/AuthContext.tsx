"use client";

import type { SessionUser } from "@/worker";
import { createContext } from "react";

/**
 * The context value is the user plus login and logout. The user fields are
 * optional because nobody is signed in until `AuthProvider` gets a user.
 *
 * React context lets any component below the provider read the user without
 * passing it down as props through every level.
 */
export type AuthContextValue = Partial<SessionUser> & {
  login: (user: SessionUser) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

// `children` is the standard React prop for whatever is nested inside the
// component. Everything rendered inside gets access to the context value.
export function AuthProvider({
  user,
  children,
}: {
  user: SessionUser | undefined;
  children: React.ReactNode;
}) {
  const login = (userData: SessionUser) => {
    // TODO: Implement login logic here.
  };

  const logout = () => {
    // TODO: Implement logout logic here.
  };

  return (
    <AuthContext value={{ ...user, login, logout }}>{children}</AuthContext>
  );
}
