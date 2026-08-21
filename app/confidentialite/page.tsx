import type { Metadata } from "next";
import { marked } from "marked";
import { getSiteContent } from "../lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent();
  const c = site.confidentialite;
  return { title: c.meta_title };
}

export default async function Page() {
  const site = await getSiteContent();
  const c = site.confidentialite;
  const html = await marked.parse(c.body);
  return (
    <div className="max-w-3xl mx-auto px-6 py-24">
      <h1 className="font-serif text-5xl">{c.titre}</h1>
      <p className="text-muted mt-4 text-sm">Dernière mise à jour : {c.date_maj}</p>
      <div className="mt-10 prose-article" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
