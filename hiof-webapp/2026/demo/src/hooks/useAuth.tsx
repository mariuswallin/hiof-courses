"use client";

import { AuthContext } from "@/context/AuthContext";
import { use } from "react";

/**
 * Reads the auth context. The guard turns a missing provider into a clear
 * error instead of an undefined further down the call stack.
 */
export function useAuth() {
  const context = use(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
