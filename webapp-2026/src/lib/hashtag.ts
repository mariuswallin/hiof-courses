// src/lib/hashtag.ts
//
// Extract hashtags from a post:
// 1. Find every word starting with # (word boundary, then # and \w+)
// 2. Lowercase
// 3. Unique, in order of appearance
// 4. Max 5 (drop the rest)
const HASHTAG_RE = /\B#(\w+)/g;
const HASHTAG_MAX = 5;

export function extractHashtags(text: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const match of text.matchAll(HASHTAG_RE)) {
    const tag = match[1].toLowerCase();
    if (!seen.has(tag)) {
      seen.add(tag);
      out.push(tag);
      if (out.length === HASHTAG_MAX) break;
    }
  }
  return out;
}
