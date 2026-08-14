// src/app/pages/Settings.tsx — the one page in Kvitter that requires a login.
//
// Everything else (feed, profiles, search) is public by design. This page shows
// what gating a route looks like: the guard sits on the route in worker.tsx
// (`route("/settings", [requireAuth, Settings])`), so an anonymous visitor is
// redirected to /login and this component never runs.
//
// Note what the guard does NOT cover: the avatar form below posts to
// /api/users/:userId/avatar, a separate route with its own auth and ownership
// check (see routes/media.ts). A guard protects the page it is attached to —
// nothing else.
import { requestInfo } from "rwsdk/worker";
import { db } from "@/db";
import { getProfileByUsername } from "@/db/queries";
import { AvatarUpload } from "@/app/components/AvatarUpload";

export async function Settings() {
  const { ctx } = requestInfo;
  // requireAuth already ran, so the session is guaranteed here.
  const username = ctx.session.username!;
  const profile = await getProfileByUsername(db, username);
  const avatarUrl = profile?.avatarKey ? `/media/${profile.avatarKey}` : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Innstillinger</h1>
        <p className="text-muted text-sm">
          Denne siden krever innlogging. Resten av Kvitter er åpen.
        </p>
      </div>

      <section className="bg-surface border border-gray-200 dark:border-gray-700 rounded-card p-4">
        <h2 className="font-semibold mb-2">Konto</h2>
        <dl className="text-sm grid grid-cols-[8rem_1fr] gap-y-1">
          <dt className="text-muted">Navn</dt>
          <dd>{ctx.session.name}</dd>
          <dt className="text-muted">E-post</dt>
          <dd>{ctx.session.email}</dd>
          <dt className="text-muted">Brukernavn</dt>
          <dd>@{username}</dd>
        </dl>
      </section>

      {profile && (
        <section className="bg-surface border border-gray-200 dark:border-gray-700 rounded-card p-4">
          <h2 className="font-semibold mb-2">Profilbilde</h2>
          <AvatarUpload userId={profile.id} currentAvatarUrl={avatarUrl} />
        </section>
      )}
    </div>
  );
}
