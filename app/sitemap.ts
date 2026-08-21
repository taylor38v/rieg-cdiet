import type { MetadataRoute } from "next";
import { getSecteurs, getArticles } from "./lib/content";

export const dynamic = "force-static";
const BASE = "https://romainrieg-immobilier.fr";

// Le site est en `trailingSlash: true` : /vendre redirige (301) vers /vendre/.
// Le sitemap doit donc déclarer les URL finales, sinon chaque URL soumise à Google
// est une redirection (gaspillage de budget de crawl + avertissement Search Console).
const url = (chemin: string) => `${BASE}${chemin}/`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const secteurs = await getSecteurs();
  const articles = await getArticles();
  const staticRoutes = [
    "", "/rejoindre", "/avis-de-valeur", "/vendre", "/acheter", "/location",
    "/contact", "/actualites", "/outils",
    "/vendre/saint-didier", "/vendre/ouest-lyonnais", "/vendre/plaine-du-forez",
    "/honoraires", "/mentions-legales", "/confidentialite",
    "/outils/carte-prix", "/outils/capacite-achat", "/outils/projection",
    "/outils/vendabilite", "/outils/frais-notaire",
    "/outils/rentabilite-locative", "/outils/acheter-vs-louer", "/outils/dpe-express",
  ];
  return [
    ...staticRoutes.map((r) => ({ url: url(r), lastModified: now, changeFrequency: "weekly" as const, priority: r === "" ? 1 : 0.7 })),
    ...secteurs.map((s) => ({ url: url(`/secteurs/${s.slug}`), lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...articles.map((a) => ({ url: url(`/actualites/${a.slug}`), lastModified: new Date(a.date), changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
