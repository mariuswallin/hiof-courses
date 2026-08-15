// src/app/pages/Profile.tsx — user profile: posts, avatar, follow
import { requestInfo } from "rwsdk/worker";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { follows } from "@/db/schema";
import { getProfileByUsername, getPostsByAuthor } from "@/db/queries";
import { PostCard } from "@/app/components/PostCard";
import { AvatarUpload } from "@/app/components/AvatarUpload";
import { FollowButton } from "@/app/components/FollowButton";

export async function Profile({ username }: { username: string }) {
  const { ctx } = requestInfo;
  const viewerId = ctx.session?.userId ?? null;

  const profile = await getProfileByUsername(db, username);
  if (!profile) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Fant ikke @{username}</h1>
        <p className="text-muted">Denne brukeren finnes ikke.</p>
      </div>
    );
  }

  const isOwn = viewerId === profile.id;

  // Posts and follow status are independent once we have the profile — fetch
  // them in parallel to avoid a waterfall.
  const [posts, followRow] = await Promise.all([
    getPostsByAuthor(db, profile.id, viewerId),
    viewerId && !isOwn
      ? db
          .select()
          .from(follows)
          .where(
            and(
              eq(follows.followerId, viewerId),
              eq(follows.followedId, profile.id),
            ),
          )
          .get()
      : Promise.resolve(undefined),
  ]);
  const initialFollowing = !!followRow;

  const avatarUrl = profile.avatarKey ? `/media/${profile.avatarKey}` : null;

  return (
    <div className="space-y-6">
      <header className="bg-surface border border-gray-200 dark:border-gray-700 rounded-card p-4 flex items-start gap-4">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
        )}
        <div className="flex-1">
          <h1 className="text-xl font-bold">
            {profile.displayName ?? profile.name}
          </h1>
          <p className="text-muted">@{profile.username ?? profile.name}</p>
          {profile.bio && <p className="mt-1">{profile.bio}</p>}
          <p className="text-sm text-muted mt-2">
            {profile.followerCount} følgere · {profile.followingCount} følger
          </p>
        </div>
        {viewerId && !isOwn && (
          <FollowButton
            followedId={profile.id}
            initialFollowing={initialFollowing}
          />
        )}
      </header>

      {isOwn && (
        <section className="bg-surface border border-gray-200 dark:border-gray-700 rounded-card p-4">
          <h2 className="font-semibold mb-2">Bytt profilbilde</h2>
          <AvatarUpload userId={profile.id} currentAvatarUrl={avatarUrl} />
        </section>
      )}

      <section className="space-y-4">
        {posts.length === 0 ? (
          <p className="text-muted">Ingen innlegg ennå.</p>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} currentUserId={viewerId} />
          ))
        )}
      </section>
    </div>
  );
}
