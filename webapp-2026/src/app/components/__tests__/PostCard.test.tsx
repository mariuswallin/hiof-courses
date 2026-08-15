// @vitest-environment happy-dom
/**
 * Component test without hooks: `PostCard` only renders props.
 * We mock `@/actions/posts` because the child `PostActions` imports it —
 * server actions import `cloudflare:workers`, which does not exist in node.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/actions/posts", () => ({
  toggleLike: vi.fn(async () => ({ ok: true, liked: true })),
  deletePost: vi.fn(async () => ({ ok: true })),
}));

import { PostCard } from "@/app/components/PostCard";
import type { FeedItem } from "@/db/queries";

function makeFeedItem(overrides: Partial<FeedItem> = {}): FeedItem {
  return {
    id: "p1",
    text: "Hei Kvitter!",
    createdAt: new Date("2026-08-10T12:00:00Z"),
    hashtags: ["koding"],
    imageKey: null,
    author: {
      id: "u1",
      username: "kari_dev",
      displayName: "Kari Dev",
      name: "Kari",
      avatarKey: null,
    },
    likeCount: 3,
    commentCount: 1,
    likedByMe: false,
    ...overrides,
  };
}

describe("PostCard", () => {
  it("viser forfatter, brukernavn og innhold", () => {
    render(<PostCard post={makeFeedItem()} currentUserId={null} />);

    expect(screen.getByText("Kari Dev")).toBeInTheDocument();
    expect(screen.getByText("@kari_dev")).toBeInTheDocument();
    expect(screen.getByText("Hei Kvitter!")).toBeInTheDocument();
  });

  it("viser hashtags som lenker", () => {
    render(<PostCard post={makeFeedItem()} currentUserId={null} />);

    const link = screen.getByRole("link", { name: "#koding" });
    expect(link).toHaveAttribute("href", "/feed/hashtag/koding");
  });

  it("viser slett-knappen kun for eieren", () => {
    const post = makeFeedItem();

    const { unmount } = render(
      <PostCard post={post} currentUserId="u2" />, // en annen bruker
    );
    expect(screen.queryByRole("button", { name: "Slett" })).toBeNull();
    unmount();

    render(<PostCard post={post} currentUserId="u1" />); // the owner
    expect(screen.getByRole("button", { name: "Slett" })).toBeInTheDocument();
  });

  it("rendrer fiendtlig input som tekst, ikke som HTML (XSS)", () => {
    const payload = "<script>alert('xss')</script>";
    render(
      <PostCard post={makeFeedItem({ text: payload })} currentUserId={null} />,
    );

    // React escapes the content: the text is there, but no <script> was created.
    expect(screen.getByText(payload)).toBeInTheDocument();
    expect(document.querySelector("script")).toBeNull();
  });
});
