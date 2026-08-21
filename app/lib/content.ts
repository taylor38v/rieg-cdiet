/* Couche de lecture du contenu — À L'EXÉCUTION, depuis Netlify Blobs (repli seed en local).
 *
 * Remplace les anciens `_generated/*.ts` (figés au build). Les composants SERVEUR
 * appellent ces getters async ; les composants CLIENT reçoivent la donnée via le
 * contexte `ClientData` (alimenté par le layout racine). `cache()` dédoublonne les
 * lectures dans un même rendu.
 */
import { cache } from "react";
import { readTable } from "../../lib/db.mjs";
import type { SecteurDetail } from "./secteursDetails";
import type { Article } from "./_generated/articles";
import type { Settings } from "./_generated/settings";
import type { SiteContent } from "./_generated/site";
export { formatPrix } from "./format";

/* ---------- Getters bruts (une table = une clé Blob) ---------- */
export const getSettings = cache(async (): Promise<Settings> => (await readTable("settings")) as Settings);
// On réutilise les TYPES générés (`SiteContent`, `Settings`, `Article`, `SecteurDetail`)
// pour garder l'inférence (`.map` sur les tableaux typés). La donnée, elle, vient des Blobs.
export const getSiteContent = cache(async (): Promise<SiteContent> => (await readTable("site")) as SiteContent);
export const getSecteursDetails = cache(async (): Promise<Record<string, SecteurDetail>> => (await readTable("secteurs")) as Record<string, SecteurDetail>);
export const getZonesContent = cache(async (): Promise<Record<string, any>> => (await readTable("zones")) as Record<string, any>);
export const getArticles = cache(async (): Promise<Article[]> => (await readTable("articles")) as Article[]);
export const getTemoignages = cache(async (): Promise<any[]> => (await readTable("temoignages")) as any[]);
export const getPagesLibres = cache(async (): Promise<any[]> => (await readTable("pages")) as any[]);

/* ---------- Secteurs (base + surcharges CMS) ----------
 * Source unique des prix / délais, lue partout (carte, pages zones, fiches, outils).
 * Les valeurs de base servent de secours ; le CMS (Fiches communes) surcharge
 * prix m² maison / appartement et délai de vente. */
export type Secteur = {
  slug: string;
  nom: string;
  intro: string;
  prixM2Maison: number;
  prixM2Appart: number;
  delaiVente: number;
  atouts: string[];
  quartiers: string[];
  image?: string;
};

export const SECTEURS_BASE: Secteur[] = [
  { slug: "saint-didier-au-mont-dor", nom: "Saint-Didier-au-Mont-d'Or", intro: "Commune résidentielle par excellence du Mont d'Or, Saint-Didier conjugue qualité de vie, écoles de référence et accès rapide à Lyon. Un marché tendu, où l'offre de maisons familiales reste rare et très recherchée.", prixM2Maison: 6256, prixM2Appart: 5330, delaiVente: 58, atouts: ["Écoles cotées", "Cadre de vie", "Proximité Lyon", "Commerces de bouche"], quartiers: ["Centre village", "Les Carrières", "Plat de l'Air", "Le Tourillon"], image: "/photos/secteurs/saint-didier-1.jpg" },
  { slug: "saint-cyr-au-mont-dor", nom: "Saint-Cyr-au-Mont-d'Or", intro: "Surplombant la Saône, Saint-Cyr est l'une des adresses les plus prestigieuses du Mont d'Or. Propriétés d'exception et biens confidentiels y dominent.", prixM2Maison: 6230, prixM2Appart: 5133, delaiVente: 74, atouts: ["Vue Saône", "Propriétés d'exception", "Écoles privées", "Cachet patrimonial"], quartiers: ["Le Bourg", "Les Verrières", "Combe Blanche"], image: "/photos/secteurs/saint-cyr-1.jpg" },
  { slug: "limonest", nom: "Limonest", intro: "Village de caractère niché sur les hauteurs, Limonest conserve un patrimoine bâti en pierres dorées remarquable, recherché par une clientèle familiale et internationale.", prixM2Maison: 5184, prixM2Appart: 4726, delaiVente: 71, atouts: ["Pierres dorées", "Mont Verdun", "Écoles internationales", "Cadre préservé"], quartiers: ["Le Bourg", "Les Grillons", "Sans Souci"], image: "/photos/secteurs/limonest-1.jpg" },
  { slug: "ecully", nom: "Écully", intro: "Aux portes de Lyon, Écully séduit par ses résidences de standing, ses grandes écoles et son parc de l'Hippodrome. Un marché porté par une demande familiale solide.", prixM2Maison: 5278, prixM2Appart: 4330, delaiVente: 62, atouts: ["Grandes écoles", "Tramway à l'étude", "Parc du Vallon", "Résidences de standing"], quartiers: ["Le Centre", "Pérollier", "Valvert", "Le Coulouvrier"], image: "/photos/secteurs/ecully-1.jpg" },
  { slug: "dardilly", nom: "Dardilly", intro: "Entre nature et métropole, Dardilly offre un compromis recherché : grands terrains, quartiers pavillonnaires calmes et accès direct à l'A6.", prixM2Maison: 4759, prixM2Appart: 4296, delaiVente: 68, atouts: ["Grands terrains", "Accès A6", "Écoles publiques réputées", "Parcours golfique"], quartiers: ["Le Paillet", "La Beffe", "Porte de Lyon", "Les Noyeraies"], image: "/photos/secteurs/dardilly-1.jpg" },
  { slug: "champagne-au-mont-dor", nom: "Champagne-au-Mont-d'Or", intro: "Commune à taille humaine, Champagne attire pour son centre village animé et sa proximité immédiate de Lyon (métro à venir).", prixM2Maison: 4889, prixM2Appart: 3937, delaiVente: 54, atouts: ["Proche Lyon", "Centre village", "Marché hebdomadaire", "Connexion TCL"], quartiers: ["Centre", "Les Bruyères", "Le Rocher"], image: "/photos/secteurs/champagne-1.jpg" },
  { slug: "saint-just-saint-rambert", nom: "Saint-Just-Saint-Rambert", intro: "Au cœur de la Plaine du Forez, Saint-Just-Saint-Rambert est un marché dynamique, accessible, idéal pour primo-accédants et investisseurs.", prixM2Maison: 2933, prixM2Appart: 2254, delaiVente: 78, atouts: ["Budget maîtrisé", "Cadre Loire", "15 min Saint-Étienne", "Investissement locatif"], quartiers: ["Centre Saint-Just", "Saint-Rambert", "Les Bords de Loire"], image: "/photos/secteurs/saint-just-1.jpg" },
  { slug: "andrezieux-boutheon", nom: "Andrézieux-Bouthéon", intro: "Pôle économique majeur de la Loire à 14 km de Saint-Étienne, Andrézieux-Bouthéon allie zones d'activité dynamiques (750+ entreprises), aéroport international, château historique et accès autoroutier direct. Un marché accessible idéal pour primo-accédants et investisseurs locatifs.", prixM2Maison: 2741, prixM2Appart: 1918, delaiVente: 82, atouts: ["Aéroport international", "Pôle économique 750+ entreprises", "Château et parc 12 ha", "A72 + gare SNCF"], quartiers: ["Bourg d'Andrézieux", "Bouthéon / Château", "La Chapelle", "Agglomération Sud"], image: "/photos/secteurs/saint-just-1.jpg" },
];

export const getSecteurs = cache(async (): Promise<Secteur[]> => {
  const map = await getSecteursDetails();
  const num = (v: unknown, fallback: number) => (typeof v === "number" && Number.isFinite(v) ? v : fallback);
  return SECTEURS_BASE.map((s) => {
    const d = (map as Record<string, any>)[s.slug];
    return {
      ...s,
      prixM2Maison: num(d?.prix_m2_maison, s.prixM2Maison),
      prixM2Appart: num(d?.prix_m2_appartement, s.prixM2Appart),
      delaiVente: num(d?.delai_vente, s.delaiVente),
    };
  });
});

/* Snapshot global passé au contexte client (une seule fois, dans le layout racine). */
export type SiteData = {
  settings: Settings;
  secteurs: Secteur[];
  secteursDetails: Record<string, SecteurDetail>;
  site: SiteContent;
};

export const getSiteData = cache(async (): Promise<SiteData> => {
  const [settings, secteurs, secteursDetails, site] = await Promise.all([
    getSettings(), getSecteurs(), getSecteursDetails(), getSiteContent(),
  ]);
  return { settings, secteurs, secteursDetails, site };
});
