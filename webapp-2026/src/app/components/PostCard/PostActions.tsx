// src/app/components/PostCard/PostActions.tsx
"use client";

import { useState, useTransition } from "react";
import { toggleLike, deletePost } from "@/actions/posts";

export function PostActions({
  postId,
  likeCount,
  commentCount,
  canDelete,
}: {
  postId: string;
  likeCount: number;
  commentCount: number;
  canDelete: boolean;
}) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(likeCount);
  const [isPending, start] = useTransition();

  function onLike() {
    start(async () => {
      const res = await toggleLike(postId);
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
