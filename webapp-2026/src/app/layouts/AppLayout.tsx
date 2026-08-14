// src/app/layouts/AppLayout.tsx
import { Nav } from "@/app/components/Nav";

export function AppLayout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Nav />
      <main className="flex-1 max-w-2xl mx-auto w-full p-4">{children}</main>
      <footer className="text-center text-sm text-muted py-4">
        Kvitter — bygd i kurset Webapplikasjoner 2026
      </footer>
    </div>
  );
}
