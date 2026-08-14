// src/app/components/PostCard/HashtagList.tsx
export function HashtagList({ hashtags }: { hashtags: string[] }) {
  if (hashtags.length === 0) return null;
  return (
    <ul className="flex gap-2 mt-2 flex-wrap">
      {hashtags.map((h) => (
        <li key={h}>
          <a
            href={`/feed/hashtag/${h}`}
            className="text-brand text-sm hover:underline"
          >
            #{h}
          </a>
        </li>
      ))}
    </ul>
  );
}
