// src/app/components/Nav.tsx — server component, reads the session from ctx
import { requestInfo } from "rwsdk/worker";
import { LogoutButton } from "@/app/components/LogoutButton";

export function Nav() {
  const session = requestInfo.ctx?.session;
  const isAuthed = session?.isAuthenticated;

  return (
    <nav className="bg-surface border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-2xl mx-auto p-4 flex gap-6 items-center">
        <a href="/" className="font-bold text-brand text-lg">
          Kvitter
        </a>
        <a href="/search" className="text-muted hover:text-brand">
          Søk
        </a>
        <a href="/about" className="text-muted hover:text-brand">
          Om
        </a>
        <div className="flex-1" />
        {isAuthed ? (
          <>
            <a href="/settings" className="text-sm text-muted hover:text-brand">
              @{session?.username}
            </a>
            <LogoutButton />
          </>
        ) : (
          <a
            href="/login"
            className="bg-brand text-white px-3 py-1 rounded text-sm"
          >
            Logg inn
          </a>
        )}
      </div>
    </nav>
  );
}
