// app/components/layouts/MainLayout.tsx

import { AuthProvider } from "@/app/context/AuthProvider";
import type { LayoutProps } from "rwsdk/router";
import { Navigation } from "../shared/Navigation";

export function MainLayout({ children, requestInfo }: LayoutProps) {
  // Set by authMiddleware. better-auth's getSession returns null for an
  // expired session, so there is no expiry check to do here.
  const user = requestInfo?.ctx.user ?? null;

  return (
    <>
      {/* <AuthProvider initialUser={user}> */}
      <header className="bg-white shadow-sm border-b">
        <Navigation user={user} />
      </header>
      <div>
        <main>{children}</main>
      </div>
      {/* </AuthProvider> */}
    </>
  );
}
