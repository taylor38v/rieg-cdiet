#!/usr/bin/env node
// Enrichit app/lib/communes-geo.json avec les communes limitrophes manquantes
// (sources : API officielle geo.api.gouv.fr).
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GEO_PATH = path.join(__dirname, "..", "app", "lib", "communes-geo.json");

// Communes à ajouter : [slug, nomOfficiel, codeDepartement]
const COMMUNES = [
  // Mont d'Or / Ouest lyonnais - département 69
  ["collonges-au-mont-dor",   "Collonges-au-Mont-d'Or",   "69"],
  ["chasselay",               "Chasselay",                "69"],
  ["marcilly-d-azergues",     "Marcilly-d'Azergues",      "69"],
  ["chazay-d-azergues",       "Chazay-d'Azergues",        "69"],
  ["craponne",                "Craponne",                 "69"],
  ["francheville",            "Francheville",             "69"],
  ["civrieux-d-azergues",     "Civrieux-d'Azergues",      "69"],
  ["lozanne",                 "Lozanne",                  "69"],
  ["dommartin",               "Dommartin",                "69"],
  // Plaine du Forez - département 42
  ["chambles",                "Chambles",                 "42"],
  ["veauchette",              "Veauchette",               "42"],
  ["unieux",                  "Unieux",                   "42"],
  ["la-fouillouse",           "La Fouillouse",            "42"],
  ["saint-romain-le-puy",     "Saint-Romain-le-Puy",      "42"],
  ["roche-la-moliere",        "Roche-la-Molière",         "42"],
  ["firminy",                 "Firminy",                  "42"],
  ["villars",                 "Villars",                  "42"],
  ["saint-priest-en-jarez",   "Saint-Priest-en-Jarez",    "42"],
  ["l-etrat",                 "L'Étrat",                  "42"],
  ["la-tour-en-jarez",        "La Tour-en-Jarez",         "42"],
  ["saint-heand",             "Saint-Héand",              "42"],
  ["saint-bonnet-les-oules",  "Saint-Bonnet-les-Oules",   "42"],
  ["saint-galmier",           "Saint-Galmier",            "42"],
  ["montrond-les-bains",      "Montrond-les-Bains",       "42"],
  ["feurs",                   "Feurs",                    "42"],
];

async function fetchCommune(nom, dept) {
  // URL avec fields=contour,centre,nom pour avoir tout
  const url = `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(nom)}&codeDepartement=${dept}&fields=nom,code,centre,contour&format=json&boost=population`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} pour ${nom}`);
  const data = await res.json();
  if (!data.length) throw new Error(`Aucune commune ${nom} trouvée en ${dept}`);
  // Cherche exact match sur nom
  const exact = data.find((c) => c.nom === nom) || data[0];
  if (!exact.contour) throw new Error(`Pas de contour pour ${nom}`);
  // centre.coordinates = [lng, lat] → on stocke [lat, lng] cohérent avec l'existant
  const [lng, lat] = exact.centre.coordinates;
  return {
    nom: exact.nom,
    center: [lat, lng],
    geometry: exact.contour, // déjà au format GeoJSON Polygon/MultiPolygon
  };
}

async function main() {
  const existing = JSON.parse(await fs.readFile(GEO_PATH, "utf-8"));
  let added = 0, skipped = 0, failed = 0;
  for (const [slug, nom, dept] of COMMUNES) {
    if (existing[slug]) {
      skipped++;
      continue;
    }
    try {
      console.log(`→ ${nom} (${dept})…`);
      const entry = await fetchCommune(nom, dept);
      existing[slug] = entry;
      added++;
      // petit throttle pour ne pas surcharger l'API
      await new Promise((r) => setTimeout(r, 200));
    } catch (e) {
      console.error(`  ✗ ${nom} : ${e.message}`);
      failed++;
    }
  }
  await fs.writeFile(GEO_PATH, JSON.stringify(existing, null, 2));
  console.log(`\n✅ Ajoutées : ${added} · ⏭ déjà présentes : ${skipped} · ✗ échecs : ${failed}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
