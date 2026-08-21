import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { marked } from "marked";
import { getPagesLibres } from "../lib/content";

// Slugs réservés à des routes statiques existantes ou techniques
// Ne pas autoriser une page libre à les écraser.
const RESERVED_SLUGS = new Set([
  "admin", "api", "uploads", "videos", "photos", "_next",
  "contact", "secteurs", "outils", "actualites", "vendre", "acheter",
  "location", "rejoindre", "avis-de-valeur", "a-propos", "mentions-legales",
  "confidentialite", "honoraires", "merci", "estimation",
]);

export async function generateStaticParams() {
  const pages = await getPagesLibres();
  return pages
    .filter((p) => !RESERVED_SLUGS.has(p.slug))
    .map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata(props: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const pages = await getPagesLibres();
  const p = pages.find((x) => x.slug === slug);
  if (!p) return {};
  return {
    title: p.titre,
    description: p.description,
    openGraph: { title: p.titre, description: p.description, images: p.hero_image ? [p.hero_image] : [] },
  };
}

export default async function Page(props: PageProps<"/[slug]">) {
  const { slug } = await props.params;
  const pages = await getPagesLibres();
  const p = pages.find((x) => x.slug === slug);
  if (!p) notFound();

  const html = await marked.parse(p.body);

  return (
    <article>
      {p.hero_image ? (
        <div className="relative h-[50vh] bg-navy">
          <img src={p.hero_image} alt={p.titre} className="absolute inset-0 w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 text-ivory">
            <div className="max-w-4xl mx-auto px-6 pb-14">
              <h1 className="font-serif text-4xl md:text-6xl leading-[1.05]">{p.titre}</h1>
              {p.description ? <p className="text-ivory/80 text-lg md:text-xl mt-6 max-w-3xl leading-relaxed">{p.description}</p> : null}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-6 pt-20 pb-8">
          <h1 className="font-serif text-4xl md:text-6xl text-navy leading-[1.05]">{p.titre}</h1>
          {p.description ? <p className="text-muted text-lg md:text-xl mt-6 max-w-3xl leading-relaxed">{p.description}</p> : null}
        </div>
      )}

      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="prose-article" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </article>
  );
}
