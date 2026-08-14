/**
 * src/test/fixtures.ts — test data and actor switching.
 *
 * The fixtures write rows straight through Drizzle (past the action layer), so
 * you can build a world before testing the action itself. `runAs` runs an
 * action as a given user and cleans up afterwards.
 *
 * Note: the user table is called `user` (singular) because Better Auth owns
 * it — Kvitter's domain fields (`username`, `displayName`, `bio`, `avatarKey`)
 * are added to that same table. See `src/db/schema.ts`.
 */
import { db, schema } from "@/test/db-mock";
import { setActor, clearActor, type TestUser } from "@/test/worker-mock";
import { extractHashtags } from "@/lib/hashtag";

let counter = 0;

/** Predictable ids per test. Call in `beforeEach`. */
export function resetCounter(): void {
  counter = 0;
}

const uid = (prefix: string): string => `${prefix}-${++counter}`;

export type MakeUserOptions = {
  id?: string;
  name?: string;
  username?: string;
  email?: string;
  bio?: string;
  avatarKey?: string;
};

/** Insert a user and return the row the test needs (id/username/email). */
export async function makeUser(opts: MakeUserOptions = {}) {
  const id = opts.id ?? uid("u");
  const username = opts.username ?? id;
  const email = opts.email ?? `${id}@test.local`;
  const name = opts.name ?? username;

  await db.insert(schema.user).values({
    id,
    name,
    email,
    username,
    displayName: name,
    bio: opts.bio ?? null,
    avatarKey: opts.avatarKey ?? null,
  });

  return { id, name, username, email } satisfies Required<TestUser>;
}

export type MakePostOptions = {
  authorId: string;
  id?: string;
  text?: string;
  imageKey?: string | null;
  deletedAt?: Date | null;
};

/** Insert a post linked to a user. Returns the row. */
export async function makePost(opts: MakePostOptions) {
  const text = opts.text ?? "hei";
  const [row] = await db
    .insert(schema.posts)
    .values({
      id: opts.id ?? uid("p"),
      text,
      authorId: opts.authorId,
      hashtagsJson: JSON.stringify(extractHashtags(text)),
      imageKey: opts.imageKey ?? null,
      deletedAt: opts.deletedAt ?? null,
    })
    .returning();
  return row!;
}

/** Insert a comment on a post. */
export async function makeComment(opts: {
  postId: string;
  authorId: string;
  text?: string;
}) {
  const [row] = await db
    .insert(schema.comments)
    .values({
      id: uid("c"),
      postId: opts.postId,
      authorId: opts.authorId,
      text: opts.text ?? "fin",
    })
    .returning();
  return row!;
}

/**
 * Run `fn` as if the user were signed in. Cleans up in `finally`, so a failing
 * test does not leak its session into the next one.
 */
export async function runAs<T>(
  user: TestUser,
  fn: () => Promise<T>,
): Promise<T> {
  setActor(user);
  try {
    return await fn();
  } finally {
    clearActor();
  }
}
