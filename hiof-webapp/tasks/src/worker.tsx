import { defineApp } from "rwsdk/worker";
import { layout, prefix, render, route } from "rwsdk/router";
import { Document } from "@/app/Document";
import { Home } from "@/app/pages/Home";

import { User, users } from "@/db/schema/user-schema";
import { setCommonHeaders } from "@/app/headers";
import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import { taskRoutes } from "@/app/features/tasks/tasksRoutes";
import { MainLayout } from "@/components/MainLayout";
import TaskListPage from "@/app/features/tasks/ui/pages/TaskList";
import TaskCreatePage from "@/app/features/tasks/ui/pages/TaskCreate";
import TaskDetailPage from "@/app/features/tasks/ui/pages/TaskDetail";

export interface Env {
  DB: D1Database;
}

export type AppContext = {
  user: User | null;
  authUrl: string;
};

export function requireAuth() {
  return ({ ctx }: { ctx: AppContext }): Response | void => {
    if (!ctx.user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 403,
            message: "Authentication required",
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

export function extractSessionFromCookies(cookieHeader: string): string | null {
  const cookies = cookieHeader.split(";").map((c) => c.trim());
  // console.log("Extracting session from cookies:", cookies);
  for (const cookie of cookies) {
    const [name, value] = cookie.split("=");
    if (name === "user_session") {
      return decodeURIComponent(value);
    }
  }

  return null;
}

export async function authenticationMiddleware({
  ctx,
  request,
}: {
  ctx: AppContext;
  request: Request;
}) {
  // Default - no user logged in
  ctx.user = null;

  try {
    // Get session cookie
    const cookies = request.headers.get("cookie");
    if (!cookies) {
      return;
    }

    const userData = extractSessionFromCookies(cookies);

    if (!userData) {
      return;
    }
    ctx.user = JSON.parse(userData) as User;
  } catch (error) {
    console.error("Authentication middleware error:", error);
    ctx.user = null;
  }
}

export default defineApp([
  setCommonHeaders(),
  authenticationMiddleware,
  prefix("/api/v1/tasks", taskRoutes),
  render(Document, [
    route("/", async () => {
      const userResult = await drizzle(env.DB).select().from(users);
      return (
        <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
          <h1>Start</h1>
          <p>Velkommen til eksempel</p>
          <p>Databasen har {userResult.length} brukere</p>
          <div style={{ margin: "1.5rem 0" }}>
            <a
              href="/home"
              style={{
                display: "inline-block",
                padding: "0.5rem 1rem",
                background: "#0070f3",
                color: "white",
                textDecoration: "none",
                borderRadius: "4px",
                fontWeight: "500",
              }}
            >
              Go to Home Page
            </a>
          </div>
        </div>
      );
    }),
    route("/home", [
      ({ ctx }) => {
        if (!ctx.user) {
          return new Response(null, {
            status: 302,
            headers: { Location: "/" },
          });
        }
      },
      Home,
    ]),
    prefix("/tasks", [
      layout(MainLayout, [
        route("/", TaskListPage),
        route("/create", TaskCreatePage),
        route("/:id", [
          requireAuth(),
          ({ params }) => <TaskDetailPage params={params} />,
        ]),
      ]),
    ]),
  ]),
]);
