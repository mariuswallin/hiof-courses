// src/app/pages/HashtagFeed.tsx — posts for one hashtag
import { requestInfo } from "rwsdk/worker";
import { db } from "@/db";
import { getFeedByHashtag } from "@/db/queries";
import { PostCard } from "@/app/components/PostCard";

export async function HashtagFeed({ tag }: { tag: string }) {
  const { ctx } = requestInfo;
  const userId = ctx.session?.userId ?? null;
  const feed = await getFeedByHashtag(db, tag);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-brand">#{tag}</h1>
      {feed.length === 0 ? (
        <p className="text-muted">Ingen innlegg med denne hashtaggen ennå.</p>
      ) : (
        feed.map((post) => (
          <PostCard key={post.id} post={post} currentUserId={userId} />
        ))
      )}
    </div>
  );
}
