#!/usr/bin/env node
/* Convertit le contenu actuel (content/*.json|md) en tables de seed (lib/seed/*.json).
 * Ces seeds servent de contenu initial quand une clé Blob est absente (1er démarrage),
 * et de source en développement local. Mêmes formes que l'ancien build-content.mjs.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CONTENT = path.join(ROOT, 'content');
const OUT = path.join(ROOT, 'lib', 'seed');
fs.mkdirSync(OUT, { recursive: true });

const write = (name, data) => {
  fs.writeFileSync(path.join(OUT, `${name}.json`), JSON.stringify(data, null, 2), 'utf8');
  const n = Array.isArray(data) ? `${data.length} entrées` : `${Object.keys(data).length} clés`;
  console.log(`✓ seed ${name}.json (${n})`);
};

function readMdFolder(folder) {
  const dir = path.join(CONTENT, folder);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => {
    const raw = fs.readFileSync(path.join(dir, f), 'utf8');
    const { data, content } = matter(raw);
    return { slug: f.replace(/\.md$/, ''), ...data, body: content.trim() };
  });
}

function readJsonMap(folder) {
  const dir = path.join(CONTENT, folder);
  if (!fs.existsSync(dir)) return {};
  return fs.readdirSync(dir).filter((f) => f.endsWith('.json')).reduce((acc, f) => {
    acc[f.replace(/\.json$/, '')] = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    return acc;
  }, {});
}

// YAML parse "date: 2026-06-03" en objet Date → normaliser en timestamp pour trier.
function dateKey(d) {
  if (!d) return 0;
  const t = d instanceof Date ? d.getTime() : Date.parse(String(d));
  return Number.isNaN(t) ? 0 : t;
}

// --- Articles (tri : ordre manuel puis date décroissante) ---
const articles = readMdFolder('articles').filter((a) => a.publie !== false).sort((a, b) => {
  const oa = a.ordre ?? Infinity, ob = b.ordre ?? Infinity;
  if (oa !== ob) return oa - ob;
  return dateKey(b.date) - dateKey(a.date);
});
write('articles', articles);

// --- Témoignages ---
write('temoignages', readMdFolder('temoignages').filter((t) => t.publie !== false).sort((a, b) => dateKey(b.date) - dateKey(a.date)));

// --- Pages libres ---
write('pages', readMdFolder('pages').filter((p) => p.publie !== false));

// --- Zones + secteurs (maps slug → objet) ---
write('zones', readJsonMap('zones'));
write('secteurs', readJsonMap('secteurs-detail'));

// --- Pages du site (json + md) ---
const SITE_DIR = path.join(CONTENT, 'site');
const site = fs.existsSync(SITE_DIR) ? fs.readdirSync(SITE_DIR).reduce((acc, f) => {
  const full = path.join(SITE_DIR, f);
  if (f.endsWith('.json')) acc[f.replace(/\.json$/, '')] = JSON.parse(fs.readFileSync(full, 'utf8'));
  else if (f.endsWith('.md')) {
    const { data, content } = matter(fs.readFileSync(full, 'utf8'));
    acc[f.replace(/\.md$/, '')] = { ...data, body: content.trim() };
  }
  return acc;
}, {}) : {};
write('site', site);

// --- Réglages ---
const settingsPath = path.join(CONTENT, 'settings.json');
write('settings', fs.existsSync(settingsPath) ? JSON.parse(fs.readFileSync(settingsPath, 'utf8')) : {});

console.log('\n✅ Seed généré dans lib/seed/');
