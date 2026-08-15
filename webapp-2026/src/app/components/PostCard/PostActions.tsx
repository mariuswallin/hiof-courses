// src/app/components/PostCard/PostActions.tsx
"use client";

import { useState, useTransition } from "react";
import { toggleLike, deletePost } from "@/actions/posts";

export function PostActions({
  postId,
  likeCount,
  commentCount,
  likedByMe,
  canDelete,
}: {
  postId: string;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  canDelete: boolean;
}) {
  // Seeded from the server (see FeedItem.likedByMe). Starting at `false` would
  // reset the filled heart on every page load, even for posts you have liked.
  const [liked, setLiked] = useState(likedByMe);
  const [count, setCount] = useState(likeCount);
  const [isPending, start] = useTransition();

  function onLike() {
    start(async () => {
      const res = await toggleLike(postId);
      // TODO: signed-out users get `{ ok: false, error: "Login required" }`
      // here and the click silently does nothing. This should prompt for
      // login instead — e.g. redirect to /login?next=<current path>, or open
      // a login dialog — so the user learns why the like did not register.
      if (!res.ok) return;
      setLiked(res.liked);
      setCount((c) => c + (res.liked ? 1 : -1));
    });
  }

  function onDelete() {
    if (!confirm("Slette innlegget?")) return;
    start(async () => {
      const res = await deletePost(postId);
      if (res.ok) window.location.reload();
    });
  }

  return (
    <footer className="flex gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-sm">
      <button
        onClick={onLike}
        disabled={isPending}
        className="text-muted hover:text-brand disabled:opacity-50"
      >
        {liked ? "♥" : "♡"} {count}
      </button>
      {/*
        Counter only — deliberately not a button. The `addComment` server
        action in src/actions/posts.ts is implemented and tested, but no UI
        calls it yet: there is no comment list and no comment form.
      */}
      <span className="text-muted">💬 {commentCount}</span>
      <div className="flex-1" />
      {canDelete && (
        <button
          onClick={onDelete}
          disabled={isPending}
          className="text-muted hover:text-red-600 disabled:opacity-50"
        >
          Slett
        </button>
      )}
    </footer>
  );
}
