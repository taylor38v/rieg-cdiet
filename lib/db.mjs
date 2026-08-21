/* Stockage des données — Netlify Blobs en production, fichiers locaux en développement.
 *
 * Remplace le pipeline Decap + git-gateway + GitHub. Aucun service tiers, aucune clé à
 * faire tourner, aucune dépendance à Netlify Identity : tout le CMS vit dans le site.
 *
 * Chaque « table » est stockée sous une clé. Certaines sont des objets (settings, site,
 * secteurs, zones), d'autres des tableaux (articles, temoignages, pages, leads, auth).
 * Repris de cdiet-solo (voir C:\Users\hsivignon\cdiet-solo\lib\db.mjs).
 */
import fs from 'node:fs';
import path from 'node:path';

const STORE = 'rieg-data';
const DIR = path.join(process.cwd(), 'data');
const SEED = path.join(process.cwd(), 'lib', 'seed');

// Objets (une seule entrée) vs collections (tableau). Sert au repli et à l'admin.
export const TABLES = {
  settings: 'object',
  site: 'object',
  secteurs: 'object',
  zones: 'object',
  articles: 'array',
  temoignages: 'array',
  pages: 'array',
  leads: 'array',
  auth: 'array',
};

let _store = null;
async function blobs() {
  if (_store !== null) return _store;
  try {
    const { getStore } = await import('@netlify/blobs');
    /* `strong` : une écriture est immédiatement relue par la lecture suivante.
       Indispensable — sinon « Enregistrer » puis un rechargement pourrait servir
       l'ancienne version (même piège que cdiet-solo). */
    _store = getStore({ name: STORE, consistency: 'strong' });
  } catch (e) {
    _store = false;   // hors Netlify : on retombe sur les fichiers locaux
  }
  return _store;
}

const vide = (table) => (TABLES[table] === 'array' ? [] : {});

const lireSeed = (table) => {
  try { return JSON.parse(fs.readFileSync(path.join(SEED, `${table}.json`), 'utf8')); }
  catch (e) { return vide(table); }
};

/* ---------- Lecture ---------- */
export async function readTable(table) {
  const s = await blobs();
  if (s) {
    try {
      const v = await s.get(table, { type: 'json' });
      if (v != null) return v;
    } catch (e) { console.warn(`blobs: lecture ${table} — ${e.message}`); }
    return lireSeed(table);           // clé absente : contenu initial
  }
  const f = path.join(DIR, `${table}.json`);
  if (fs.existsSync(f)) {
    try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { /* fichier abîmé */ }
  }
  return lireSeed(table);
}

/* ---------- Écriture ---------- */
export async function writeTable(table, value) {
  const s = await blobs();
  if (s) {
    await s.setJSON(table, value);
    return;
  }
  fs.mkdirSync(DIR, { recursive: true });
  fs.writeFileSync(path.join(DIR, `${table}.json`), JSON.stringify(value, null, 2), 'utf8');
}

/* ---------- Fichiers (photos, uploads) ---------- */
const MEDIA_STORE = 'rieg-media';
const MEDIA_DIR = path.join(process.cwd(), 'data', 'media');

export async function putMedia(key, buffer, contentType) {
  const s = await blobs();
  if (s) {
    const { getStore } = await import('@netlify/blobs');
    const m = getStore({ name: MEDIA_STORE, consistency: 'strong' });
    await m.set(key, buffer, { metadata: { contentType } });
    return;
  }
  fs.mkdirSync(MEDIA_DIR, { recursive: true });
  fs.writeFileSync(path.join(MEDIA_DIR, key.replace(/[/\\]/g, '_')), buffer);
  fs.writeFileSync(path.join(MEDIA_DIR, key.replace(/[/\\]/g, '_') + '.type'), contentType || 'application/octet-stream', 'utf8');
}

export async function getMedia(key) {
  const s = await blobs();
  if (s) {
    const { getStore } = await import('@netlify/blobs');
    const m = getStore({ name: MEDIA_STORE, consistency: 'strong' });
    const r = await m.getWithMetadata(key, { type: 'arrayBuffer' });
    if (!r) return null;
    return { buffer: Buffer.from(r.data), contentType: (r.metadata && r.metadata.contentType) || 'application/octet-stream' };
  }
  const f = path.join(MEDIA_DIR, key.replace(/[/\\]/g, '_'));
  if (!fs.existsSync(f)) return null;
  let ct = 'application/octet-stream';
  try { ct = fs.readFileSync(f + '.type', 'utf8'); } catch (e) { /* type inconnu */ }
  return { buffer: fs.readFileSync(f), contentType: ct };
}
