// src/app/components/FollowButton.tsx
"use client";
import { useState, useTransition } from "react";
import { toggleFollow } from "@/actions/follows";

export function FollowButton({
  followedId,
  initialFollowing,
}: {
  followedId: string;
  initialFollowing: boolean;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [isPending, start] = useTransition();

  function onClick() {
    start(async () => {
      const res = await toggleFollow(followedId);
      if (res.ok) setFollowing(res.following);
    });
  }

  return (
    <button
      onClick={onClick}
      disabled={isPending}
      className="bg-brand text-white px-3 py-1 rounded-button text-sm disabled:opacity-50"
    >
      {following ? "Følger" : "Følg"}
    </button>
  );
}
