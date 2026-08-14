/**
 * `requireAuth` is the guard on the one protected page (/settings) and on the
 * writing API routes. The routing around it cannot be tested here — importing
 * `rwsdk/router` fails outside the Workers runtime — but the guard itself is a
 * plain function of (ctx, request), so its three outcomes are.
 */
import { describe, it, expect } from "vitest";
import { requireAuth } from "@/middleware/require-auth";
import type { Session } from "@/middleware/session";

const anonymous: Session = {
  userId: null,
  name: null,
  username: null,
  email: null,
  isAuthenticated: false,
};

const signedIn: Session = {
  userId: "u1",
  name: "Alice",
  username: "alice",
  email: "alice@kvitter.no",
  isAuthenticated: true,
};

function call(session: Session, accept: string, url = "https://kvitter.no/settings") {
  return requireAuth({
    ctx: { session },
    request: new Request(url, { headers: { accept } }),
  } as Parameters<typeof requireAuth>[0]);
}

describe("requireAuth", () => {
  it("slipper gjennom en innlogget bruker", async () => {
    expect(await call(signedIn, "text/html")).toBeUndefined();
  });

  it("sender nettleser-navigasjon til /login, med vei tilbake", async () => {
    const denied = await call(anonymous, "text/html");

    expect(denied?.status).toBe(302);
    expect(denied?.headers.get("Location")).toBe(
      "/login?from=https%3A%2F%2Fkvitter.no%2Fsettings",
    );
  });

  it("gir API-kall 401 i stedet for en redirect", async () => {
    const denied = await call(anonymous, "application/json");

    expect(denied?.status).toBe(401);
  });

  it("RETURNERER avslaget i stedet for å kaste", async () => {
    // Kontrakten rwsdk-middleware forventer: en returnert Response kortslutter
    // pipelinen rent. Kaster den i stedet, slipper feilen ut av ruteren og
    // logges som en uhåndtert feil. Denne testen låser formen.
    await expect(call(anonymous, "text/html")).resolves.toBeInstanceOf(Response);
  });
});
