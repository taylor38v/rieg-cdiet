#!/usr/bin/env node
/* Normalise le corps des articles en HTML.
 * - Corps en Markdown  → converti en HTML par marked.
 * - Corps déjà en HTML → laissé tel quel (marked laisse passer le HTML).
 * - <h1> → <h2> : la page affiche déjà le titre en h1, et l'éditeur n'expose que H2/H3.
 * Objectif : un seul format (HTML) pour l'éditeur riche ET pour le rendu du site.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FICHIER = path.join(__dirname, "..", "lib", "seed", "articles.json");

const articles = JSON.parse(fs.readFileSync(FICHIER, "utf8"));
let convertis = 0;

for (const a of articles) {
  const avant = a.body || "";
  if (!avant.trim()) continue;
  let html = await marked.parse(avant);
  html = html.replace(/<h1(\s[^>]*)?>/gi, "<h2>").replace(/<\/h1>/gi, "</h2>");
  if (html !== avant) convertis++;
  a.body = html;
}

fs.writeFileSync(FICHIER, JSON.stringify(articles, null, 2), "utf8");
console.log(`✅ ${articles.length} articles traités, ${convertis} normalisés en HTML.`);
