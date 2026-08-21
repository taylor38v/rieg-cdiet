/* Fonctions pures, sans dépendance serveur — importables aussi bien côté serveur que
 * côté client (contrairement à content.ts qui touche aux Blobs). */
export const formatPrix = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
