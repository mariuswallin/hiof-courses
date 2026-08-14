// src/db/__tests__/queries.test.ts
// Integration test of the feed queries against in-memory SQLite (better-sqlite3).
// The query functions take `db` as a parameter, so they run against both D1
// (prod) and better-sqlite3 (test) — both are SQLiteAsyncDatabase.
import { describe, it, expect, beforeEach } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@/db/schema";
import { relations } from "@/db/relations";
import {
  getFeed,
  getFeedForUser,
  getFeedByHashtag,
  getPostsByAuthor,
  getProfileByUsername,
} from "@/db/queries";

const SQL = `
CREATE TABLE "user" (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  email_verified INTEGER NOT NULL DEFAULT 0,
  image TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  username TEXT UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_key TEXT
);
CREATE TABLE posts (
  id TEXT PRIMARY KEY NOT NULL,
  text TEXT NOT NULL,
  author_id TEXT NOT NULL REFERENCES "user"(id),
  hashtags_json TEXT NOT NULL DEFAULT '[]',
  image_key TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  deleted_at INTEGER
);
CREATE TABLE comments (
  id TEXT PRIMARY KEY NOT NULL,
  post_id TEXT NOT NULL REFERENCES posts(id),
  author_id TEXT NOT NULL REFERENCES "user"(id),
  text TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);
CREATE TABLE likes (
  post_id TEXT NOT NULL REFERENCES posts(id),
  user_id TEXT NOT NULL REFERENCES "user"(id),
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  PRIMARY KEY (post_id, user_id)
);
CREATE TABLE follows (
  follower_id TEXT NOT NULL REFERENCES "user"(id),
  followed_id TEXT NOT NULL REFERENCES "user"(id),
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  PRIMARY KEY (follower_id, followed_id)
);
`;

let db: any;

beforeEach(() => {
  const sqlite = new Database(":memory:");
  sqlite.exec(SQL);
  db = drizzle({ client: sqlite, relations });

  db.insert(schema.user)
    .values([
      { id: "u1", name: "Alice", email: "a@k.no", username: "alice", displayName: "Alice A" },
      { id: "u2", name: "Bob", email: "b@k.no", username: "bob", displayName: "Bob B" },
    ])
    .run();

  db.insert(schema.posts)
    .values([
      { id: "p1", text: "Hei #koding", authorId: "u1", hashtagsJson: '["koding"]' },
      { id: "p2", text: "Bob poster", authorId: "u2", hashtagsJson: "[]" },
      // Soft-deleted — must not appear in the feed.
      { id: "p3", text: "Slettet", authorId: "u1", hashtagsJson: "[]", deletedAt: new Date() },
    ])
    .run();

  db.insert(schema.likes).values({ postId: "p1", userId: "u2" }).run();
  db.insert(schema.comments)
    .values({ id: "c1", postId: "p1", authorId: "u2", text: "Bra!" })
    .run();
  db.insert(schema.follows).values({ followerId: "u1", followedId: "u2" }).run();
});

describe("getFeed", () => {
  it("ekskluderer myk-slettede innlegg", async () => {
    const feed = await getFeed(db);
    expect(feed.map((p) => p.id).sort()).toEqual(["p1", "p2"]);
  });

  it("teller likes og kommentarer", async () => {
    const feed = await getFeed(db);
    const p1 = feed.find((p) => p.id === "p1")!;
    expect(p1.likeCount).toBe(1);
    expect(p1.commentCount).toBe(1);
    expect(p1.hashtags).toEqual(["koding"]);
    expect(p1.author.username).toBe("alice");
  });
});

describe("getFeedForUser", () => {
  it("viser egne + fulgtes innlegg", async () => {
    // u1 follows u2 → sees both p1 (own) and p2 (bob)
    const feed = await getFeedForUser(db, "u1");
    expect(feed.map((p) => p.id).sort()).toEqual(["p1", "p2"]);
  });

  it("viser kun egne når man ikke følger noen", async () => {
    const feed = await getFeedForUser(db, "u2");
    expect(feed.map((p) => p.id)).toEqual(["p2"]);
  });
});

describe("getFeedByHashtag", () => {
  it("filtrerer på hashtag", async () => {
    const feed = await getFeedByHashtag(db, "koding");
    expect(feed.map((p) => p.id)).toEqual(["p1"]);
  });

  it("returnerer tomt for ukjent hashtag", async () => {
    expect(await getFeedByHashtag(db, "finnesikke")).toEqual([]);
  });
});

describe("getPostsByAuthor", () => {
  it("returnerer kun forfatterens ikke-slettede innlegg", async () => {
    const feed = await getPostsByAuthor(db, "u1");
    expect(feed.map((p) => p.id)).toEqual(["p1"]);
  });
});

describe("getProfileByUsername", () => {
  it("henter profil med følger-tall", async () => {
    const profile = await getProfileByUsername(db, "bob");
    expect(profile?.id).toBe("u2");
    expect(profile?.followerCount).toBe(1); // u1 follows u2
    expect(profile?.followingCount).toBe(0);
  });

  it("returnerer null for ukjent brukernavn", async () => {
    expect(await getProfileByUsername(db, "ingen")).toBeNull();
  });
});
