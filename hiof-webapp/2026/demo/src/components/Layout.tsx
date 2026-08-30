import { AuthProvider } from "@/context/AuthContext";
import type { LayoutProps } from "rwsdk/router";

// `LayoutProps` is what rwsdk passes a layout: `children` for the wrapped
// route, and `requestInfo` for the same request context the routes get.
export async function MainLayout({ children, requestInfo }: LayoutProps) {
  // `ctx.user` can be undefined, see `fakeSetUserContext` in src/worker.tsx,
  // so everything reading it has to handle that.
  const user = requestInfo?.ctx?.user;
  // TODO: Could validate permissions here using ctx.user.

  return (
    <AuthProvider user={user}>
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
        }}
      >
        {user?.name ?? "Not signed in"}
      </h1>
      <div className="layout">{children}</div>
    </AuthProvider>
  );
}
