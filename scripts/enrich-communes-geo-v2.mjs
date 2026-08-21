#!/usr/bin/env node
// Ajout des dernières communes limitrophes (vague 2)
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GEO_PATH = path.join(__dirname, "..", "app", "lib", "communes-geo.json");

const COMMUNES = [
  // Ouest lyonnais - 69
  ["lyon",                       "Lyon",                       "69"],
  ["fontaines-sur-saone",        "Fontaines-sur-Saône",        "69"],
  ["sainte-foy-les-lyon",        "Sainte-Foy-lès-Lyon",        "69"],
  ["villeurbanne",               "Villeurbanne",               "69"],
  ["saint-genis-les-ollieres",   "Saint-Genis-les-Ollières",   "69"],
  // Plaine du Forez - 42
  ["saint-etienne",              "Saint-Étienne",              "42"],
  ["chamboeuf",                  "Chambœuf",                   "42"],
];

async function fetchCommune(nom, dept) {
  const url = `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(nom)}&codeDepartement=${dept}&fields=nom,code,centre,contour&format=json&boost=population`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} pour ${nom}`);
  const data = await res.json();
  if (!data.length) throw new Error(`Aucune commune ${nom} trouvée en ${dept}`);
  const exact = data.find((c) => c.nom === nom) || data[0];
  if (!exact.contour) throw new Error(`Pas de contour pour ${nom}`);
  const [lng, lat] = exact.centre.coordinates;
  return { nom: exact.nom, center: [lat, lng], geometry: exact.contour };
}

async function main() {
  const existing = JSON.parse(await fs.readFile(GEO_PATH, "utf-8"));
  let added = 0, skipped = 0, failed = 0;
  for (const [slug, nom, dept] of COMMUNES) {
    if (existing[slug]) { skipped++; continue; }
    try {
      console.log(`→ ${nom} (${dept})…`);
      const entry = await fetchCommune(nom, dept);
      existing[slug] = entry;
      added++;
      await new Promise((r) => setTimeout(r, 200));
    } catch (e) {
      console.error(`  ✗ ${nom} : ${e.message}`);
      failed++;
    }
  }
  await fs.writeFile(GEO_PATH, JSON.stringify(existing, null, 2));
  console.log(`\n✅ +${added} · ⏭ ${skipped} · ✗ ${failed}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
