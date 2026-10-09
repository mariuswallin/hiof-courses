// src/app/middleware/authorization.ts

import type { RequestInfo } from "rwsdk/worker";
import type { UserRole } from "@/app/types/auth";

import { Errors } from "../types/errors";
import { hasRole } from "../lib/auth/role";

// ctx.user is set by authMiddleware (src/auth/middleware.ts) on every request.
// These interruptors RETURN a Response to stop the route. They never throw.

// Require authentication
export function requireAuth() {
  return ({ ctx }: RequestInfo): Response | void => {
    if (!ctx.user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: Errors.UNAUTHORIZED,
            message: "Authentication required",
          },
        }),
        {
          status: 302,
          headers: { Location: "/auth/login" },
        }
      );
    }

    // `banned` comes from better-auth's admin plugin
    if (ctx.user.banned) {
      return new Response(
        JSON.stringify({
          error: {
            code: Errors.FORBIDDEN,
            message: "Account banned",
          },
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  };
}

// Require role
export function requireRole(role: UserRole) {
  return ({ ctx }: RequestInfo): Response | void => {
    if (!ctx.user) {
      return new Response(null, {
        status: 302,
        headers: { Location: "/auth/login" },
      });
    }

    if (!hasRole(ctx.user, role)) {
      return new Response(
        JSON.stringify({
          error: {
            code: Errors.FORBIDDEN,
            message: "Utilstrekkelige rettigheter",
          },
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  };
}

// Require admin role
export function requireAdmin() {
  return requireRole("admin");
}
