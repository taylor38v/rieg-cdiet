import type { Metadata } from "next";
import { marked } from "marked";
import { getSiteContent } from "../lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent();
  const m = site["mentions-legales"];
  return { title: m.meta_title };
}

export default async function Page() {
  const site = await getSiteContent();
  const m = site["mentions-legales"];
  const html = await marked.parse(m.body);
  return (
    <div className="max-w-3xl mx-auto px-6 py-24">
      <h1 className="font-serif text-5xl">{m.titre}</h1>
      <div className="mt-10 prose-article" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
