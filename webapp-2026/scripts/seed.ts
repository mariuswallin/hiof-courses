// scripts/seed.ts — run with: pnpm seed (rwsdk worker-run)
//
// Seeds demo users plus posts/likes/follows/comments. Demo users are inserted
// straight into the `user` table (no password or account row), so they cannot
// log in — they only own posts so the feed has content. Create real users
// through /register.
import { defineScript } from "rwsdk/worker";
import { db } from "@/db";
import { user, posts, likes, comments, follows } from "@/db/schema";
import { extractHashtags } from "@/lib/hashtag";

const sampleUsers = [
  { id: "u_alice", username: "alice", email: "alice@kvitter.no", displayName: "Alice Andersen" },
  { id: "u_bob", username: "bob", email: "bob@kvitter.no", displayName: "Bob Berg" },
  { id: "u_carol", username: "carol", email: "carol@kvitter.no", displayName: "Carol Carlsen" },
  { id: "u_dan", username: "dan", email: "dan@kvitter.no", displayName: "Dan Dahl" },
  { id: "u_eve", username: "eve", email: "eve@kvitter.no", displayName: "Eve Eriksen" },
];

const samplePosts = [
  "Lagde middag av rester i dag #matlaging #bærekraft",
  "Sola skinner endelig — vår!",
  "Skrev min første D1-spørring #koding",
  "Hva er deres beste boktips?",
  "Tre timer på Workers AI = 0 dollar #cloudflare",
  "Refactor med mapper/DTO sparte 80 % vedlikehold",
  "Ny Drizzle-versjon ute #typescript",
  "Test-driven development er ikke for puritanere",
  "Klar for fjelltur i helga ☀️",
  "Best #pizza i Oslo? Tar imot tips",
  "Jobber med autz i kveld — better-auth ser ryddig ut",
  "Hvor mange husker du `:active` i CSS?",
  "Nyttårsforsett: én commit hver dag",
  "Lyttet til Lex Fridman om LLM-trening",
  "Skrudd opp første cron-job — neste post er auto",
  "Klassisk: 'works on my machine' #devops",
  "Tailwind v4 + RWSDK = match",
  "Lærte om Vectorize i dag — semantisk søk er magisk #ai",
  "Hvilken modell bruker dere mest? Claude/GPT?",
  "Kaffe + kode = mandag",
];

export default defineScript(async () => {
  for (const u of sampleUsers) {
    await db
      .insert(user)
      .values({
        id: u.id,
        name: u.displayName,
        email: u.email,
        emailVerified: true,
        username: u.username,
        displayName: u.displayName,
      })
      .onConflictDoNothing();
  }

  for (let i = 0; i < samplePosts.length; i++) {
    const author = sampleUsers[i % sampleUsers.length];
    await db
      .insert(posts)
      .values({
        id: `p_${i.toString().padStart(3, "0")}`,
        text: samplePosts[i],
        authorId: author.id,
        hashtagsJson: JSON.stringify(extractHashtags(samplePosts[i])),
      })
      .onConflictDoNothing();
  }

  // Deterministic likes: each user likes the next three posts.
  for (let u = 0; u < sampleUsers.length; u++) {
    for (let k = 0; k < 3; k++) {
      const postId = `p_${(((u * 3 + k) % samplePosts.length))
        .toString()
        .padStart(3, "0")}`;
      await db
        .insert(likes)
        .values({ postId, userId: sampleUsers[u].id })
        .onConflictDoNothing();
    }
  }

  const followPairs: [string, string][] = [
    ["u_alice", "u_bob"],
    ["u_alice", "u_carol"],
    ["u_bob", "u_alice"],
    ["u_carol", "u_alice"],
    ["u_dan", "u_eve"],
  ];
  for (const [follower, followed] of followPairs) {
    await db
      .insert(follows)
      .values({ followerId: follower, followedId: followed })
      .onConflictDoNothing();
  }

  for (let i = 0; i < 10; i++) {
    const author = sampleUsers[i % sampleUsers.length];
    const postId = `p_${(i % samplePosts.length).toString().padStart(3, "0")}`;
    await db
      .insert(comments)
      .values({
        id: `c_${i.toString().padStart(3, "0")}`,
        postId,
        authorId: author.id,
        text: `Bra innlegg ${i + 1}!`,
      })
      .onConflictDoNothing();
  }

  console.log("🌱 Seed fullført");
  return Response.json({ ok: true });
});
