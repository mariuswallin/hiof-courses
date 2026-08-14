// src/app/pages/Home.tsx — the feed (server component)
import { requestInfo } from "rwsdk/worker";
import { db } from "@/db";
import { getFeed } from "@/db/queries";
import { NewPostForm } from "@/app/components/NewPostForm";
import { PostCard } from "@/app/components/PostCard";

export async function Home() {
  const { ctx } = requestInfo;
  const userId = ctx.session?.userId ?? null;
  const feed = await getFeed(db);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Feed</h1>

      {ctx.session?.isAuthenticated ? (
        <NewPostForm />
      ) : (
        <p className="text-muted">
          <a href="/login" className="text-brand hover:underline">
            Logg inn
          </a>{" "}
          for å skrive innlegg.
        </p>
      )}

      {feed.length === 0 ? (
        <p className="text-muted">Ingen innlegg ennå. Bli den første!</p>
      ) : (
        feed.map((post) => (
          <PostCard key={post.id} post={post} currentUserId={userId} />
        ))
      )}
    </div>
  );
}
