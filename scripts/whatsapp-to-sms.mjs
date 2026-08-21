#!/usr/bin/env node
// Remplace les liens et libellés WhatsApp par des liens SMS directs.
// Le numéro reste identique (settings.whatsapp).
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const SCAN_DIRS = ["app", "content"];
const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "out", "_generated", ".netlify"]);
const VALID_EXT = new Set([".tsx", ".ts", ".js", ".mjs", ".jsx", ".json", ".md"]);

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

const REPLACES = [
  // Liens : wa.me → sms:+
  [/https:\/\/wa\.me\/33679571473\?text=/g, "sms:+33679571473?body="],
  [/https:\/\/wa\.me\/33679571473/g, "sms:+33679571473"],
  // Template literal pattern (Footer) : `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`
  [/https:\/\/wa\.me\/\$\{settings\.whatsapp\.replace\(\/\\D\/g, ""\)\}/g, "sms:${settings.whatsapp}"],
  // Template literal pattern (WhatsApp.tsx) : `https://wa.me/${wa}?text=...`
  [/https:\/\/wa\.me\/\$\{wa\}\?text=/g, "sms:${settings.whatsapp}?body="],
  [/https:\/\/wa\.me\/\$\{wa\}/g, "sms:${settings.whatsapp}"],
  // Labels
  [/💬 WhatsApp/g, "💬 SMS"],
  // Labels JSON spécifiques (sidebar contact)
  [/"Démarrer un chat"/g, '"Envoyer un SMS"'],
];

async function main() {
  const files = (await Promise.all(SCAN_DIRS.map((d) => walk(path.join(ROOT, d))))).flat();
  let filesTouched = 0, totalChanges = 0;
  for (const f of files) {
    const src = await fs.readFile(f, "utf-8");
    let next = src;
    let changesInFile = 0;
    for (const [re, replace] of REPLACES) {
      const before = next;
      next = next.replace(re, replace);
      if (next !== before) {
        const count = (before.match(re) || []).length;
        changesInFile += count;
      }
    }
    if (changesInFile > 0) {
      await fs.writeFile(f, next);
      console.log(`✓ ${path.relative(ROOT, f)} (${changesInFile})`);
      filesTouched++;
      totalChanges += changesInFile;
    }
  }
  console.log(`\n✅ ${totalChanges} remplacement${totalChanges > 1 ? "s" : ""} dans ${filesTouched} fichier${filesTouched > 1 ? "s" : ""}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
