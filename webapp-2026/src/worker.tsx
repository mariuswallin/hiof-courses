// src/worker.tsx — Kvitter worker entry point
import { defineApp } from "rwsdk/worker";
import { route, render, layout } from "rwsdk/router";

import { setCommonHeaders } from "@/app/headers";
import { Document } from "@/app/Document";
import { sessionMiddleware } from "@/middleware/session";
import { validateOrigin } from "@/middleware/csrf";
import { AppLayout } from "@/app/layouts/AppLayout";

import { Home } from "@/app/pages/Home";
import { About } from "@/app/pages/About";
import { Login } from "@/app/pages/Login";
import { Register } from "@/app/pages/Register";
import { Search } from "@/app/pages/Search";
import { Profile } from "@/app/pages/Profile";
import { HashtagFeed } from "@/app/pages/HashtagFeed";
import { Settings } from "@/app/pages/Settings";

import { requireAuth } from "@/middleware/require-auth";

import { postsRoutes } from "@/routes/posts";
import { aiRoutes } from "@/routes/ai";
import { authRoute } from "@/routes/auth";
import { mediaRoutes } from "@/routes/media";

import { scheduled } from "@/scheduled";

const app = defineApp([
  setCommonHeaders(),
  sessionMiddleware,

  // Origin validation on state-changing /api calls. Must come before the API
  // routes it protects.
  validateOrigin(),

  // Better Auth — sign-up / sign-in / sign-out / get-session.
  authRoute,

  // REST + AI + media.
  ...postsRoutes,
  ...aiRoutes,
  ...mediaRoutes,

  route("/api/status", () =>
    Response.json({
      status: "ok",
      version: "1.0.0",
      up_since: new Date().toISOString(),
    }),
  ),

  // Pages — rendered in Document + AppLayout.
  //
  // Almost all of them are public on purpose: Kvitter is a public microblog, so
  // the feed, profiles and search read fine while signed out. Writing is what
  // requires a session, and that check lives in the server actions rather than
  // out here (see src/actions/posts.ts for why a route guard would not reach
  // them).
  //
  // /settings is the exception, and the one example of a guarded route: the
  // `requireAuth` interruptor runs before the component, so an anonymous
  // visitor gets a 302 to /login and `Settings` never renders. Note that this
  // guards the page only — the avatar endpoint it posts to has its own check.
  render(Document, [
    layout(AppLayout, [
      route("/", Home),
      route("/about", About),
      route("/login", Login),
      route("/register", Register),
      route("/search", Search),
      route("/settings", [requireAuth, Settings]),
      route("/u/:username", ({ params }) => <Profile username={params.username} />),
      route("/feed/hashtag/:tag", ({ params }) => <HashtagFeed tag={params.tag} />),
    ]),
  ]),
]);

// fetch from rwsdk + scheduled handler for cron.
export default { fetch: app.fetch, scheduled };
