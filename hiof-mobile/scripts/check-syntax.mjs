// check-syntax.mjs — rask syntakssjekk av ALL kode i repoet, uten install.
//
//   node scripts/check-syntax.mjs            # sjekk alt
//   node scripts/check-syntax.mjs l-19 l-30  # sjekk bare noen mapper
//
// Bruker TypeScript-parseren direkte. Den fanger syntaksfeil: ubalanserte
// JSX-tagger, manglende parenteser, feil i generics. Den sier IKKE noe om typer
// eller om importer finnes — til det trenger du `npm install` + `tsc --noEmit`
// i mappa (se scripts/check-types.sh).
//
// Kjøretid: ~1 sekund for hele repoet.

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { createRequire } from "node:module";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const require = createRequire(import.meta.url);

// TypeScript hentes fra l-30, som er den eneste mappa med node_modules.
let ts;
try {
  ts = require(join(ROOT, "lectures/l-30/node_modules/typescript"));
} catch {
  try {
    ts = require("typescript");
  } catch {
    console.error(
      "Fant ikke typescript. Kjør `npm install` i lectures/l-30 først,\n" +
        "eller `npm i -g typescript`.",
    );
    process.exit(2);
  }
}

const SKIP = new Set([
  "node_modules", "ios", "android", ".expo", ".git", "dist", "build", "Pods",
]);

function walk(dir, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (/\.(tsx?|jsx?|mjs)$/.test(e.name) && !e.name.endsWith(".d.ts")) acc.push(p);
  }
  return acc;
}

const filter = process.argv.slice(2);
const projects = readdirSync(ROOT, { withFileTypes: true })
  .filter((e) => e.isDirectory() && !SKIP.has(e.name) && e.name !== "scripts")
  // lectures/ og starters/ er samlemapper — de inneholder selv ingen app,
  // så vi går ett nivå ned i dem.
  .flatMap((e) =>
    e.name === "lectures" || e.name === "starters"
      ? readdirSync(join(ROOT, e.name), { withFileTypes: true })
          .filter((d) => d.isDirectory())
          .map((d) => join(e.name, d.name))
      : [e.name],
  )
  .filter((p) => existsSync(join(ROOT, p, "package.json")))
  .filter((p) => filter.length === 0 || filter.some((f) => p.includes(f)))
  .sort();

let totalFiles = 0;
let totalErrors = 0;
const failed = [];

for (const proj of projects) {
  const dir = join(ROOT, proj);
  if (!statSync(dir).isDirectory()) continue;
  const files = walk(dir);
  let errs = 0;

  for (const file of files) {
    totalFiles++;
    const text = readFileSync(file, "utf8");
    const sf = ts.createSourceFile(
      file,
      text,
      ts.ScriptTarget.Latest,
      /* setParentNodes */ false,
      file.endsWith(".tsx") || file.endsWith(".jsx")
        ? ts.ScriptKind.TSX
        : ts.ScriptKind.TS,
    );
    // parseDiagnostics er internt, men stabilt og det eneste som gir oss
    // syntaksfeil uten et fullt Program (som ville krevd node_modules).
    const diags = sf.parseDiagnostics ?? [];
    for (const d of diags) {
      const { line, character } = sf.getLineAndCharacterOfPosition(d.start);
      const msg = ts.flattenDiagnosticMessageText(d.messageText, " ");
      console.log(`${relative(ROOT, file)}:${line + 1}:${character + 1}  ${msg}`);
      errs++;
    }
  }

  totalErrors += errs;
  if (errs) failed.push(`${proj} (${errs})`);
  const mark = errs ? "FEIL" : "ok  ";
  console.log(`${mark}  ${proj.padEnd(30)} ${files.length} filer`);
}

console.log(
  `\n${projects.length} prosjekter · ${totalFiles} filer · ${totalErrors} syntaksfeil`,
);
if (failed.length) {
  console.log("Feilet: " + failed.join(", "));
  process.exit(1);
}
