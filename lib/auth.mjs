/* Authentification du back-office — sans service tiers, sans Netlify Identity.
 *
 * Mot de passe haché (scrypt + sel), secret de session en variable d'environnement.
 * PAS de middleware (le middleware Next tourne en edge avec des env figées à la
 * compilation → signatures divergentes ; bug connu). Tout est vérifié côté Node :
 * le layout du back-office et chaque route /api/admin/*. Repris de cdiet-solo.
 */
import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { readTable, writeTable } from './db.mjs';

const COOKIE = 'rieg_session';
const DUREE = 60 * 60 * 24 * 30;                       // 30 jours
const SECRET = process.env.SESSION_SECRET || 'rieg-secret-a-remplacer-en-production';

/* ---------- Mot de passe ---------- */
const hacher = (mdp, sel) =>
  crypto.scryptSync(String(mdp), sel, 32).toString('hex');

export function creerHash(mdp) {
  const sel = crypto.randomBytes(16).toString('hex');
  return { sel, hash: hacher(mdp, sel) };
}

export function verifierMdp(mdp, sel, hash) {
  const calcule = Buffer.from(hacher(mdp, sel), 'hex');
  const attendu = Buffer.from(String(hash), 'hex');
  return calcule.length === attendu.length && crypto.timingSafeEqual(calcule, attendu);
}

/* Le compte, créé au premier démarrage à partir des variables d'environnement. */
export async function lireCompte() {
  const rows = await readTable('auth');
  if (rows && rows.length && rows[0].hash) return rows[0];

  const email = (process.env.ADMIN_EMAIL || 'romain.rieg@iadfrance.fr').trim().toLowerCase();
  const mdp = process.env.ADMIN_PASSWORD || 'Rieg@2026';
  const { sel, hash } = creerHash(mdp);
  const compte = { email, sel, hash, updated_at: new Date().toISOString() };
  await writeTable('auth', [compte]);
  return compte;
}

export async function changerMdp(nouveau) {
  const compte = await lireCompte();
  const { sel, hash } = creerHash(nouveau);
  await writeTable('auth', [{ ...compte, sel, hash, updated_at: new Date().toISOString() }]);
}

/* ---------- Session ---------- */
const signer = (donnees) =>
  crypto.createHmac('sha256', SECRET).update(donnees).digest('base64url');

export function creerJeton(email) {
  const exp = Math.floor(Date.now() / 1000) + DUREE;
  const donnees = `${email}.${exp}`;
  return `${Buffer.from(donnees).toString('base64url')}.${signer(donnees)}`;
}

export function lireJeton(jeton) {
  if (!jeton || !jeton.includes('.')) return null;
  const [corps, sig] = jeton.split('.');
  let donnees;
  try { donnees = Buffer.from(corps, 'base64url').toString('utf8'); } catch (e) { return null; }

  const attendu = signer(donnees);
  const a = Buffer.from(sig || '');
  const b = Buffer.from(attendu);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;   // signature invalide

  const [email, exp] = donnees.split('.');
  if (!exp || Number(exp) < Math.floor(Date.now() / 1000)) return null;      // expirée
  return { email };
}

/* ---------- À utiliser dans les pages serveur et /api/admin/* ---------- */
export async function sessionActuelle() {
  const jeton = (await cookies()).get(COOKIE)?.value;
  return lireJeton(jeton);
}

export const COOKIE_NOM = COOKIE;
export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: DUREE,
};
