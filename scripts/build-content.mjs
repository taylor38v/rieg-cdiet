#!/usr/bin/env node
// Génère app/lib/_generated/*.ts à partir de content/*.md|json
// Lancé en prebuild + predev pour que les composants client puissent importer la donnée.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONTENT = path.join(ROOT, "content");
const OUT = path.join(ROOT, "app", "lib", "_generated");

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

function readMdFolder(folder) {
  const dir = path.join(CONTENT, folder);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const full = path.join(dir, f);
      const slug = f.replace(/\.md$/, "");
      const raw = fs.readFileSync(full, "utf8");
      const { data, content } = matter(raw);
      return { slug, ...data, body: content.trim() };
    });
}

function writeTs(name, code) {
  fs.writeFileSync(path.join(OUT, name), code, "utf8");
  console.log(`✓ generated ${path.relative(ROOT, path.join(OUT, name))}`);
}

// YAML parse "date: 2026-06-03" en objet Date : String(date) donne "Wed Jun 03 2026...".
// Comparer ces chaînes trierait par jour de la semaine -> on normalise en timestamp.
function dateKey(d) {
  if (!d) return 0;
  const t = d instanceof Date ? d.getTime() : Date.parse(String(d));
  return Number.isNaN(t) ? 0 : t;
}

// --- Articles ---
const articles = readMdFolder("articles")
  .filter((a) => a.publie !== false)
  // Tri : d'abord par "ordre" manuel si renseigné (1 = en premier), sinon par date décroissante.
  .sort((a, b) => {
    const oa = a.ordre ?? Infinity, ob = b.ordre ?? Infinity;
    if (oa !== ob) return oa - ob;
    return dateKey(b.date) - dateKey(a.date);
  });

writeTs(
  "articles.ts",
  `// AUTO-GENERATED - ne pas éditer à la main.
// Source : content/articles/*.md  ·  Régénéré par scripts/build-content.mjs

export type Article = {
  slug: string;
  titre: string;
  chapo: string;
  rubrique: string;
  date: string;
  duree_lecture: number;
  auteur: string;
  image: string;
  publie: boolean;
  ordre?: number;
  body: string;
};

export const articles: Article[] = ${JSON.stringify(articles, null, 2)};
`
);

// --- Témoignages ---
const temoignages = readMdFolder("temoignages")
  .filter((t) => t.publie !== false)
  .sort((a, b) => dateKey(b.date) - dateKey(a.date));

writeTs(
  "temoignages.ts",
  `// AUTO-GENERATED - ne pas éditer à la main.
// Source : content/temoignages/*.md  ·  Régénéré par scripts/build-content.mjs

export type Temoignage = {
  slug: string;
  nom: string;
  ville: string;
  contexte: string;
  note: number;
  date: string;
  publie: boolean;
  body: string;
};

export const temoignages: Temoignage[] = ${JSON.stringify(temoignages, null, 2)};
`
);

// --- Pages libres ---
const pages = readMdFolder("pages").filter((p) => p.publie !== false);

writeTs(
  "pages.ts",
  `// AUTO-GENERATED - ne pas éditer à la main.
// Source : content/pages/*.md  ·  Régénéré par scripts/build-content.mjs

export type PageLibre = {
  slug: string;
  titre: string;
  description?: string;
  hero_image?: string;
  publie: boolean;
  body: string;
};

export const pages: PageLibre[] = ${JSON.stringify(pages, null, 2)};
`
);

// --- Helper : lit tous les .json d'un dossier en map { filename → contenu } ---
function readJsonMap(folder) {
  const dir = path.join(CONTENT, folder);
  if (!fs.existsSync(dir)) return {};
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .reduce((acc, f) => {
      const key = f.replace(/\.json$/, "");
      acc[key] = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
      return acc;
    }, {});
}

// --- Zones (3 zones de vente) ---
const zones = readJsonMap("zones");
writeTs("zones.ts", `// AUTO-GENERATED - content/zones/*.json
export const zonesContent = ${JSON.stringify(zones, null, 2)} as const;
`);

// --- Secteurs détaillés (7 communes) ---
const secteursDetailContent = readJsonMap("secteurs-detail");
writeTs("secteurs-detail.ts", `// AUTO-GENERATED - content/secteurs-detail/*.json
export const secteursDetailContent: Record<string, any> = ${JSON.stringify(secteursDetailContent, null, 2)};
`);

// --- Pages du site (textes éditables des pages existantes) ---
const SITE_DIR = path.join(CONTENT, "site");
const sitePages = fs.existsSync(SITE_DIR)
  ? fs.readdirSync(SITE_DIR).reduce((acc, f) => {
      const full = path.join(SITE_DIR, f);
      if (f.endsWith(".json")) {
        const key = f.replace(/\.json$/, "");
        acc[key] = JSON.parse(fs.readFileSync(full, "utf8"));
      } else if (f.endsWith(".md")) {
        const key = f.replace(/\.md$/, "");
        const raw = fs.readFileSync(full, "utf8");
        const { data, content } = matter(raw);
        acc[key] = { ...data, body: content.trim() };
      }
      return acc;
    }, {})
  : {};

writeTs(
  "site.ts",
  `// AUTO-GENERATED - ne pas éditer à la main.
// Source : content/site/*.json  ·  Régénéré par scripts/build-content.mjs

export const site = ${JSON.stringify(sitePages, null, 2)} as const;

export type SiteContent = typeof site;
`
);

// --- Settings ---
const settingsPath = path.join(CONTENT, "settings.json");
const settings = fs.existsSync(settingsPath)
  ? JSON.parse(fs.readFileSync(settingsPath, "utf8"))
  : {};

writeTs(
  "settings.ts",
  `// AUTO-GENERATED - ne pas éditer à la main.
// Source : content/settings.json  ·  Régénéré par scripts/build-content.mjs

export type Settings = {
  nom: string;
  titre: string;
  logo?: string;
  logo_alt?: string;
  justifier_textes?: boolean;
  btn_sms_label?: string;
  btn_mail_label?: string;
  telephone: string;
  telephone_lien: string;
  email: string;
  whatsapp: string;
  rcs: string;
  carte_pro: string;
  garantie: string;
  secteur_principal: string;
  instagram?: string;
  linkedin?: string;
  facebook?: string;
  tiktok?: string;
  calcom?: string;
  horaires: string;
  delai_avis: string;
  bio_courte: string;
  bio_longue: string;
  carte?: {
    legende_titre?: string;
    label_mont_dor?: string;
    label_forez?: string;
    label_limitrophes?: string;
    aide?: string;
  };
  nav?: {
    rejoindre?: string;
    avis_de_valeur?: string;
    vendre?: string;
    acheter?: string;
    location?: string;
    outils?: string;
    actualites?: string;
    contact_cta?: string;
  };
  footer?: {
    cta_telephone_label?: string;
    cta_sms_label?: string;
    cta_mail_label?: string;
    cta_contact_label?: string;
    col_site_titre?: string;
    lien_rejoindre?: string;
    lien_avis_de_valeur?: string;
    lien_vendre?: string;
    lien_acheter?: string;
    lien_location?: string;
    lien_outils?: string;
    lien_actualites?: string;
    col_newsletter_titre?: string;
    newsletter_texte?: string;
    newsletter_zone_gold?: string;
    newsletter_zones_gold?: string[];
    newsletter_placeholder?: string;
    newsletter_bouton?: string;
    col_joindre_titre?: string;
    lien_sms_label?: string;
    lien_iad_label?: string;
    adresse?: string;
    secteurs_surtitre?: string;
    secteurs_titre?: string;
    secteurs_intro?: string;
    limitrophes_label?: string;
    copyright?: string;
    lien_mentions_legales?: string;
    lien_confidentialite?: string;
    lien_contact?: string;
  };
  whatsapp_widget?: {
    statut_en_ligne?: string;
    cta_sms_label?: string;
    cta_contact_label?: string;
    reponse_label?: string;
    reponse_valeur?: string;
    reponse_disponibilite?: string;
  };
  cta?: {
    titre?: string;
    intro?: string;
  };
};

export const settings: Settings = ${JSON.stringify(settings, null, 2)};
`
);

console.log("\n✅ Content built : ", articles.length, "articles · ", temoignages.length, "témoignages · ", pages.length, "pages libres · ", Object.keys(sitePages).length, "pages site");
