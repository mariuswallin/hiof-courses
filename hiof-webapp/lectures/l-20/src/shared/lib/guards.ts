// src/shared/lib/guards.ts
import { ErrorResponse, requestInfo } from "rwsdk/worker";

export function requireUser() {
  const { ctx } = requestInfo;
  if (!ctx.user) {
    throw new ErrorResponse(401, "Innlogging kreves");
  }
  return ctx.user;
}

export function requireAdmin() {
  const user = requireUser();
  if (user.role !== "admin") {
    throw new ErrorResponse(403, "Kun admin har tilgang");
  }
  return user;
}
