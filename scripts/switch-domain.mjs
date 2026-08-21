#!/usr/bin/env node
/**
 * Bascule du domaine preview → domaine de production.
 *
 * Usage :
 *   node scripts/switch-domain.mjs www.romainrieg-immobilier.fr
 *   (avec ou sans https://, avec ou sans www — normalisé automatiquement)
 *
 * Remplace l'URL preview Netlify partout (SEO, sitemap, robots, Plausible, CMS).
 * Après exécution : git commit + push → build auto Netlify.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const OLD_HOST = "rieg-immobilier-preview.netlify.app";

const arg = process.argv[2];
if (!arg) {
  console.error("❌ Domaine manquant.\n   Exemple : node scripts/switch-domain.mjs www.romainrieg-immobilier.fr");
  process.exit(1);
}

// Normalisation : on garde juste le host (sans https://, sans slash final)
const NEW_HOST = arg.replace(/^https?:\/\//, "").replace(/\/+$/, "").trim();
if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(NEW_HOST)) {
  console.error(`❌ Domaine invalide : "${NEW_HOST}"`);
  process.exit(1);
}

// Fichiers concernés (chemins relatifs à la racine du projet)
const FILES = [
  "app/layout.tsx",      // metadataBase, OpenGraph url, canonical, Plausible data-domain
  "app/sitemap.ts",      // BASE du sitemap
  "public/admin/config.yml", // site_url, display_url, logo_url (Decap)
  "public/robots.txt",   // ligne Sitemap:
];

let totalFiles = 0;
let totalReplacements = 0;

for (const rel of FILES) {
  const abs = path.join(ROOT, rel);
  let src;
  try {
    src = await fs.readFile(abs, "utf-8");
  } catch {
    console.warn(`⏭  ${rel} introuvable, ignoré`);
    continue;
  }
  const count = (src.match(new RegExp(OLD_HOST.replace(/\./g, "\\."), "g")) || []).length;
  if (count === 0) {
    console.log(`–  ${rel} : rien à remplacer`);
    continue;
  }
  const next = src.split(OLD_HOST).join(NEW_HOST);
  await fs.writeFile(abs, next);
  console.log(`✓  ${rel} : ${count} remplacement(s)`);
  totalFiles++;
  totalReplacements += count;
}

console.log(`\n✅ ${totalReplacements} remplacement(s) dans ${totalFiles} fichier(s).`);
console.log(`   ${OLD_HOST}  →  ${NEW_HOST}\n`);
console.log("Étapes suivantes :");
console.log("  1. Brancher le domaine dans Netlify (Domain management) + DNS");
console.log("  2. Créer le site Plausible avec le nouveau domaine (ou retirer le script)");
console.log("  3. git add -A && git commit -m \"Bascule domaine production\" && git push");
console.log("     (le build auto Netlify mettra le site en ligne)");
