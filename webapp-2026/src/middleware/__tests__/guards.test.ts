/**
 * Authorization. 401 = "I do not know who you are", 403 = "I know who you
 * are, but you are not allowed". The split between authentication and
 * authorization, expressed in status codes.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("rwsdk/worker", () => import("@/test/worker-mock"));

import { setActor, clearActor, ErrorResponse } from "@/test/worker-mock";
import { requireUser, requireOwner, requireRole } from "@/middleware/guards";

describe("guards", () => {
  beforeEach(() => {
    clearActor();
  });

  it("requireUser kaster 401 uten sesjon", () => {
    try {
      requireUser();
      expect.unreachable("skulle ha kastet");
    } catch (error) {
      expect(error).toBeInstanceOf(ErrorResponse);
      expect((error as ErrorResponse).code).toBe(401);
    }
  });

  it("requireUser returnerer sesjonen når brukeren er innlogget", () => {
    setActor({ id: "u1" });

    expect(requireUser().userId).toBe("u1");
  });

  it("requireOwner slipper gjennom eieren", () => {
    setActor({ id: "u1" });

    expect(requireOwner("u1").userId).toBe("u1");
  });

  it("requireOwner kaster 403 for feil bruker", () => {
    setActor({ id: "u2" });

    try {
      requireOwner("u1");
      expect.unreachable("skulle ha kastet");
    } catch (error) {
      expect((error as ErrorResponse).code).toBe(403);
    }
  });

  it("requireRole kaster 403 når sesjonen mangler rollen", () => {
    setActor({ id: "u1" });

    try {
      requireRole("admin");
      expect.unreachable("skulle ha kastet");
    } catch (error) {
      expect((error as ErrorResponse).code).toBe(403);
    }
  });
});
