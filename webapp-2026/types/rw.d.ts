// Vite-spesifikke import-augmenteringer. AppContext-augmenteringen
// (ctx.session) ligger i src/middleware/session.ts der Session-typen bor.
declare module "*?url" {
  const result: string;
  export default result;
}
