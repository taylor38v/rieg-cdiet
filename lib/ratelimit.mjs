/* Limitation des tentatives de connexion au back-office (par IP).
 * Repris de cdiet-solo. Stockage : Netlify Blobs en prod, mémoire en dev. */

const CLE = 'login-attempts';
const STORE = 'rieg-data';

const MAX_ECHECS = 5;
const FENETRE_MS = 15 * 60 * 1000;
const BLOCAGE_BASE_MS = 15 * 60 * 1000;
const BLOCAGE_MAX_MS = 6 * 60 * 60 * 1000;
const PURGE_MS = 24 * 60 * 60 * 1000;

let memoire = null;

async function blobs() {
  if (memoire) return null;
  try {
    const { getStore } = await import('@netlify/blobs');
    return getStore({ name: STORE, consistency: 'strong' });
  } catch (e) {
    memoire = memoire || new Map();
    return null;
  }
}

async function lire() {
  const s = await blobs();
  if (!s) return Object.fromEntries(memoire);
  try { return (await s.get(CLE, { type: 'json' })) || {}; }
  catch (e) { return {}; }
}

async function ecrire(tout) {
  const s = await blobs();
  if (!s) { memoire = new Map(Object.entries(tout)); return; }
  try { await s.setJSON(CLE, tout); } catch (e) { /* ne jamais bloquer la connexion */ }
}

export function adresseIp(request) {
  const h = request.headers;
  return (
    h.get('x-nf-client-connection-ip') ||
    (h.get('x-forwarded-for') || '').split(',')[0].trim() ||
    'inconnue'
  );
}

export async function verifierBlocage(ip) {
  const tout = await lire();
  const e = tout[ip];
  if (!e || !e.bloqueJusqu) return { bloque: false };
  const reste = e.bloqueJusqu - Date.now();
  if (reste <= 0) return { bloque: false };
  return { bloque: true, resteSecondes: Math.ceil(reste / 1000) };
}

export async function enregistrerEchec(ip) {
  const tout = await lire();
  const maintenant = Date.now();
  for (const [k, v] of Object.entries(tout)) {
    if (maintenant - (v.dernier || 0) > PURGE_MS) delete tout[k];
  }
  const e = tout[ip] || { echecs: 0, paliers: 0, dernier: 0, bloqueJusqu: 0 };
  if (maintenant - e.dernier > FENETRE_MS) e.echecs = 0;
  e.echecs += 1;
  e.dernier = maintenant;
  let restants = MAX_ECHECS - e.echecs;
  if (e.echecs >= MAX_ECHECS) {
    const duree = Math.min(BLOCAGE_BASE_MS * 2 ** e.paliers, BLOCAGE_MAX_MS);
    e.bloqueJusqu = maintenant + duree;
    e.paliers += 1;
    e.echecs = 0;
    restants = 0;
  }
  tout[ip] = e;
  await ecrire(tout);
  return { restants };
}

export async function reinitialiser(ip) {
  const tout = await lire();
  if (tout[ip]) { delete tout[ip]; await ecrire(tout); }
}
