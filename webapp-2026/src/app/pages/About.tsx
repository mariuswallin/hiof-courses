// src/app/pages/About.tsx — server component
export function About() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">Om Kvitter</h1>
      <p className="text-muted">
        Mikroblogg bygd i kurset Webapplikasjoner høst 2026.
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>RedwoodSDK + Cloudflare Workers (React 19 + RSC)</li>
        <li>Better Auth — registrering, innlogging, sesjoner</li>
        <li>Drizzle ORM + Cloudflare D1</li>
        <li>Workers AI — hashtag-forslag og semantisk søk (RAG)</li>
        <li>Vectorize — vektordatabase for semantisk søk</li>
        <li>R2 — profil- og innleggsbilder</li>
        <li>Cron — daglig opprydding av slettede innlegg</li>
      </ul>
    </div>
  );
}
