/* Prix / secteurs : la donnée vit maintenant dans content.ts (lecture Blobs à
 * l'exécution via getSecteurs()). Ce fichier ne garde que des ré-exports pour ne
 * pas casser les imports existants. `formatPrix` vient de format.ts (pur, client-safe). */
export { formatPrix } from "./format";
export type { Secteur } from "./content";
