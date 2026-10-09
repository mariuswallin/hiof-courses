// src/app/types/auth.ts

import type { Session } from "@/auth/auth";

// The user better-auth puts in ctx.user (includes role/banned from the admin plugin)
export type AuthUser = Session["user"];

export type UserRole = "user" | "admin";
