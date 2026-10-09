import { defineApp, ErrorResponse, type RequestInfo } from "rwsdk/worker";
import { except, layout, prefix, render, route } from "rwsdk/router";
import { Document } from "@/app/Document";

import { User, users } from "./db/schema/user-schema";
import { setCommonHeaders } from "./app/headers";
import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import { taskRoutes } from "./features/tasks/tasksRoutes";
import TaskListPage from "./features/tasks/pages/TaskListPage";
import { seedData } from "./db/seed";
import TaskDetailRSC from "./features/tasks/pages/TaskDetailRSC";
import TaskDetailOld from "./features/tasks/pages/TaskDetailOld";
import TaskEdit from "./features/tasks/pages/TaskEdit";
import TaskEditOld from "./features/tasks/pages/TaskEditOld";
import TaskSortable from "./features/tasks/pages/TaskSortable";
import { MainLayout } from "./components/Layout";
import { scheduled } from "./scheduled";

/**
 * The user as the app sees it on `ctx`: the database row plus the fields that
 * come from signing in, such as `isAdmin`. It is its own type rather than
 * `User` from the schema, because the schema only describes the table.
 */
export type SessionUser = User & { isAdmin: boolean };

// `AppContext` is what lives on `ctx` for every request. types/rw.d.ts feeds
// it into rwsdk's `DefaultAppContext`, which is what makes `ctx.user` typed
// inside routes, layouts and actions.
export type AppContext = {
  user: SessionUser | undefined;
  authUrl: string;
};

const fakeSetUserContext = async (context: RequestInfo) => {
  // Stand-in for real auth. In a real app you would read the user off the
  // request, for example a JWT in the headers or a session cookie, and
  // usually check against the database that the account is still active.
  const { ctx } = context;
  ctx.user = {
    id: 1,
    name: "Test User",
    email: "test@example.com",
    isAdmin: false,
  };

  // Parse JWT token from Authorization header

  // if (!ctx.user) {
  //   return new Response("Unauthorized", { status: 401 });
  // }
  // if(ctx.user.status === "banned") {
  //   return new Response("Forbidden", { status: 403 });
  // }
  //ctx.user = undefined;
};

/**
 * One error handler for the whole app. Anything thrown in middleware, routes
 * or server actions lands here, including `ErrorResponse` from the tasks
 * controller. API calls get JSON, pages get a plain error page.
 */
const handleErrors = except((error, { request }) => {
  const isErrorResponse = error instanceof ErrorResponse;
  const status = isErrorResponse ? error.code : 500;
  const message = isErrorResponse ? error.message : "Internal Server Error";

  if (!isErrorResponse) {
    console.error("Unhandled error:", error);
  }

  if (new URL(request.url).pathname.startsWith("/api/")) {
    return Response.json(
      { success: false, error: { message, code: status } },
      { status },
    );
  }

  return new Response(`${status} — ${message}`, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
});

const app = defineApp([
  setCommonHeaders(),
  handleErrors,
  fakeSetUserContext, // Run for all routes

  // Seed route, for seeding from the browser or a REST client instead of
  // `pnpm seed`.
  //
  // POST only on purpose: the route wipes and refills the database, and a
  // destructive GET can be triggered by a crawler or a link prefetch.
  // Any other verb gets 405 from the router.
  //
  // The token is a simple guard so the route is not open to anyone who knows
  // the URL. Send it as `x-seed-token`. It lives in `vars` in wrangler.jsonc,
  // which is public, so change it and make it a real secret before deploying.
  route("/api/seed", {
    post: async ({ request }) => {
      if (request.headers.get("x-seed-token") !== env.SEED_TOKEN) {
        throw new ErrorResponse(401, "Invalid seed token");
      }

      await seedData(env);
      return Response.json({ success: true });
    },
  }),

  prefix("/api/v1/tasks", taskRoutes), // API routes with controllers, services etc.

  route("/test/*", (ctx) => {
    console.log("Test route hit:", ctx.request.url, ctx.params);
    const params = ctx.params.$0.split("/");
    const isApiRoute = params[0] === "api";
    if (isApiRoute) {
      return Response.json({ message: "This is a test API route", params });
    }
    if (params.length === 1) {
      return new Response(`This is a test route with param: ${params[0]}`);
    }
    if (params.length === 2) {
      const firstParam = "param1-value";
      const secondParam = "param2-value";
      return new Response(
        `This is a test route with params: ${firstParam}, ${secondParam}`,
      );
    }
    return new Response("This is a test route response");
  }), // Example of a simple test route

  render(Document, [
    route("/", async () => {
      // Simple example showing how to use the db directly in the route
      const userResult = await drizzle(env.DB).select().from(users);
      return (
        <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
          <h1>Start</h1>
          <p>Velkommen til eksempel</p>
          <p>Databasen har {userResult.length} brukere</p>
        </div>
      );
    }),
    prefix("/tasks", [
      () => {
        const loggedIn = true;
        if (!loggedIn) {
          throw new ErrorResponse(401, "Unauthorized");
        }
      }, // Run for all /tasks routes
      layout(MainLayout, [
        route("/", TaskListPage), // Page using RSC
        route("/sortable", TaskSortable), // Page using drag and drop + action
        route("/rsc/:taskId", TaskDetailRSC), // Page using RSC with params
        route("/old/:taskId", ({ params }) => (
          <TaskDetailOld params={params} /> // Page using regular rendering with params
        )),
        route("/:taskId/edit", TaskEdit), //  Page using server actions with params
        route("/old/:taskId/edit", ({ params }) => (
          <TaskEditOld params={params} />
        )), //  Page using regular pattern for update
      ]),
    ]),
  ]),
]);

/**
 * A Worker has more than one entry point. `fetch` answers HTTP; `scheduled`
 * is what Cloudflare calls on the cron triggers in wrangler.jsonc, with no
 * request and no user involved. `defineApp` only builds the fetch side, so
 * the default export is assembled by hand here.
 */
export default { fetch: app.fetch, scheduled };
