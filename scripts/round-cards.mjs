#!/usr/bin/env node
// Ajoute rounded-xl aux cards du site pour harmoniser le style.
// Cible : bg-white/bg-navy/bg-ivory-deep/bg-gold avec padding, sans rounded existant.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..", "app");

async function walk(dir) {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "_generated") continue;
      out.push(...(await walk(full)));
    } else if (e.name.endsWith(".tsx") || e.name.endsWith(".ts")) {
      out.push(full);
    }
  }
  return out;
}

// Patterns de cards à arrondir. On capture la classe entière, et on insère "rounded-xl " si
// aucun "rounded-" n'est déjà présent dans cette même classe.
const CARD_PATTERNS = [
  // bg-white border border-ink/10 p-X
  /className=("|`|')((?:[^"`']*?\b)?bg-white\b[^"`']*?\bborder\s+border-ink\/10\b[^"`']*?\bp-\d+[^"`']*?)\1/g,
  // bg-navy text-ivory p-X (cards primary)
  /className=("|`|')((?:[^"`']*?\b)?bg-navy\b[^"`']*?\btext-ivory\b[^"`']*?\bp-\d+[^"`']*?)\1/g,
  // bg-ivory-deep p-X
  /className=("|`|')((?:[^"`']*?\b)?bg-ivory-deep\b[^"`']*?\bp-\d+[^"`']*?)\1/g,
  // bg-gold/10 border border-gold
  /className=("|`|')((?:[^"`']*?\b)?bg-gold\/10\b[^"`']*?\bborder\b[^"`']*?\bborder-gold\b[^"`']*?)\1/g,
  // bg-gold/5 border border-gold
  /className=("|`|')((?:[^"`']*?\b)?bg-gold\/5\b[^"`']*?\bborder\b[^"`']*?\bborder-gold\b[^"`']*?)\1/g,
  // bg-navy-soft p-X
  /className=("|`|')((?:[^"`']*?\b)?bg-navy-soft\b[^"`']*?\bp-\d+[^"`']*?)\1/g,
  // bg-white border border-ink/15
  /className=("|`|')((?:[^"`']*?\b)?bg-white\b[^"`']*?\bborder\s+border-ink\/15\b[^"`']*?)\1/g,
];

function patch(src) {
  let out = src;
  let changed = 0;
  for (const re of CARD_PATTERNS) {
    out = out.replace(re, (m, q, cls) => {
      // Si rounded-* déjà présent dans cette classe (full/xl/lg/md/sm/none/2xl/3xl), ne rien faire
      if (/\brounded(-[a-z0-9]+)?\b/.test(cls)) return m;
      // Sinon, on insère rounded-xl en début de classe
      changed++;
      return `className=${q}rounded-xl ${cls.trim()}${q}`;
    });
  }
  return { out, changed };
}

async function main() {
  const files = await walk(ROOT);
  let totalFiles = 0, totalChanges = 0;
  for (const f of files) {
    const src = await fs.readFile(f, "utf-8");
    const { out, changed } = patch(src);
    if (changed > 0 && out !== src) {
      await fs.writeFile(f, out);
      console.log(`✓ ${path.relative(ROOT, f)} (${changed} card${changed > 1 ? "s" : ""})`);
      totalFiles++;
      totalChanges += changed;
    }
  }
  console.log(`\n✅ ${totalChanges} card${totalChanges > 1 ? "s" : ""} arrondies dans ${totalFiles} fichier${totalFiles > 1 ? "s" : ""}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
