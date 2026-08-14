// src/app/components/PostCard/PostHeader.tsx
import type { FeedAuthor } from "@/db/queries";

export function PostHeader({
  author,
  createdAt,
}: {
  author: FeedAuthor;
  createdAt: Date;
}) {
  const handle = author.username ?? author.name;
  const display = author.displayName ?? author.name;
  const href = author.username ? `/u/${author.username}` : "#";

  return (
    <header className="flex items-center gap-2 mb-2">
      {author.avatarKey ? (
        <img
          src={`/media/${author.avatarKey}`}
          alt=""
          className="h-8 w-8 rounded-full object-cover"
        />
      ) : (
        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
      )}
      <div className="flex flex-col leading-tight">
        <a href={href} className="font-semibold">
          {display}
        </a>
        <span className="text-xs text-muted">@{handle}</span>
      </div>
      <time
        className="ml-auto text-sm text-muted"
        dateTime={createdAt.toISOString()}
      >
        {createdAt.toLocaleString("no-NO")}
      </time>
    </header>
  );
}
