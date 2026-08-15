// src/app/components/PostCard/index.tsx
import { PostHeader } from "./PostHeader";
import { HashtagList } from "./HashtagList";
import { PostActions } from "./PostActions";
import type { FeedItem } from "@/db/queries";

export function PostCard({
  post,
  currentUserId,
}: {
  post: FeedItem;
  currentUserId: string | null;
}) {
  return (
    <article className="bg-surface border border-gray-200 dark:border-gray-700 rounded-card p-4">
      <PostHeader author={post.author} createdAt={post.createdAt} />
      <p className="whitespace-pre-wrap">{post.text}</p>
      {post.imageKey && (
        <img
          src={`/media/${post.imageKey}`}
          alt=""
          className="mt-2 max-h-96 rounded-lg"
          loading="lazy"
        />
      )}
      <HashtagList hashtags={post.hashtags} />
      <PostActions
        postId={post.id}
        likeCount={post.likeCount}
        commentCount={post.commentCount}
        likedByMe={post.likedByMe}
        canDelete={currentUserId === post.author.id}
      />
    </article>
  );
}
