// app/components/layouts/MainLayout.tsx

import type { LayoutProps } from "rwsdk/router";

export async function MainLayout({ children, requestInfo }: LayoutProps) {
  const user = requestInfo?.ctx.user ?? null;

  return (
    <div>
      <header className="bg-white shadow-sm border-b">
        <nav className="container mx-auto px-4 py-2 flex justify-between items-center">
          <div className="text-lg font-semibold">Task Manager</div>
          <a href="/" className="text-sm text-gray-600 hover:underline">
            Hjem
          </a>
          <a href="/tasks" className="text-sm text-gray-600 hover:underline">
            Tasks
          </a>
          <a
            href="/tasks/create"
            className="text-sm text-gray-600 hover:underline"
          >
            Ny task
          </a>
        </nav>
      </header>
      <section className="container mx-auto px-4 py-2">
        {user ? (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Velkommen, {user.name}
            </span>
          </div>
        ) : null}
      </section>
      <main>{children}</main>
      <footer className="bg-gray-100 text-center text-sm text-gray-500 py-4 mt-8">
        &copy; {new Date().getFullYear()} Task Manager. All rights reserved.
      </footer>
    </div>
  );
}
