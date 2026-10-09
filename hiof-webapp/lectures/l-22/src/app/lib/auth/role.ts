// app/lib/auth/role.ts

import type { AuthUser, UserRole } from "@/app/types/auth";

// Type guards for role-based checks
export const isAdmin = (user: AuthUser | null): boolean => {
  return user?.role === "admin";
};

export const isUser = (user: AuthUser | null): boolean => {
  return user !== null;
};

export const hasRole = (user: AuthUser | null, role: UserRole): boolean => {
  if (!user) return false;
  if (role === "admin") return user.role === "admin";
  return true; // All authenticated users have "user" role
};

// Only admin can delete questions (for now)
export const canDeleteQuestion = (user: AuthUser | null): boolean => {
  if (!user) return false;
  return isAdmin(user);
};

// Only admin can edit questions (for now)
export const canEditQuestion = (user: AuthUser | null): boolean => {
  if (!user) return false;
  return isAdmin(user);
};

// Only admin can mutate questions (for now)
export const canMutateQuestion = (user: AuthUser | null): boolean => {
  if (!user) return false;
  return isAdmin(user);
};
