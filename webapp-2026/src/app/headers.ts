import type { RouteMiddleware } from "rwsdk/router";

/**
 * Security headers on every response. Skipped in local dev
 * (`VITE_IS_DEV_SERVER`) so HMR and sourcemaps are not blocked.
 */
export const setCommonHeaders =
  (): RouteMiddleware =>
  ({ response, rw: { nonce } }) => {
    if (!import.meta.env.VITE_IS_DEV_SERVER) {
      // HTTPS-only for 2 years.
      response.headers.set(
        "Strict-Transport-Security",
        "max-age=63072000; includeSubDomains; preload",
      );
    }

    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Referrer-Policy", "no-referrer");
    response.headers.set("Cross-Origin-Opener-Policy", "same-origin");

    // No geolocation, microphone or camera in the app.
    response.headers.set(
      "Permissions-Policy",
      "geolocation=(), microphone=(), camera=()",
    );

    // CSP — strict by default. 'unsafe-eval' is kept for the rwsdk RSC bootstrap.
    response.headers.set(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        `script-src 'self' 'unsafe-eval' 'nonce-${nonce}'`,
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob:",
        "media-src 'self' data: blob:",
        "frame-ancestors 'self'",
        "object-src 'none'",
      ].join("; "),
    );
  };
