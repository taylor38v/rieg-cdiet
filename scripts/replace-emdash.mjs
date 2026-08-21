#!/usr/bin/env node
// Remplace tous les em-dashes "-" (U+2014) par des tirets simples "-" (U+002D)
// dans le code source (app/, content/, public/admin/, scripts/).
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const SCAN_DIRS = ["app", "content", "public/admin", "scripts"];
const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "out", "_generated", ".netlify"]);
const VALID_EXT = new Set([".tsx", ".ts", ".js", ".mjs", ".jsx", ".json", ".md", ".css", ".yml", ".yaml", ".html"]);

async function walk(dir, out = []) {
  let entries;
  try { entries = await fs.readdir(dir, { withFileTypes: true }); }
  catch { return out; }
  for (const e of entries) {
    if (SKIP_DIRS.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) await walk(full, out);
    else if (VALID_EXT.has(path.extname(e.name))) out.push(full);
  }
  return out;
}

async function main() {
  const files = (await Promise.all(SCAN_DIRS.map((d) => walk(path.join(ROOT, d))))).flat();
  let filesTouched = 0, totalReplaced = 0;
  for (const f of files) {
    const src = await fs.readFile(f, "utf-8");
    if (!src.includes("-")) continue;
    const count = (src.match(/-/g) || []).length;
    const next = src.replace(/-/g, "-");
    await fs.writeFile(f, next);
    console.log(`✓ ${path.relative(ROOT, f)} (${count})`);
    filesTouched++;
    totalReplaced += count;
  }
  console.log(`\n✅ ${totalReplaced} em-dash remplacé${totalReplaced > 1 ? "s" : ""} dans ${filesTouched} fichier${filesTouched > 1 ? "s" : ""}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
