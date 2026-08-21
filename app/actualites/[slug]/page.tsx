import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { marked } from "marked";
import { getArticles } from "../../lib/content";

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata(props: PageProps<"/actualites/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const articles = await getArticles();
  const a = articles.find((x) => x.slug === slug);
  if (!a) return {};
  return {
    title: a.titre,
    description: a.chapo,
    openGraph: { title: a.titre, description: a.chapo, images: [a.image] },
  };
}

const formatDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

export default async function Page(props: PageProps<"/actualites/[slug]">) {
  const { slug } = await props.params;
  const articles = await getArticles();
  const a = articles.find((x) => x.slug === slug);
  if (!a) notFound();

  const others = articles.filter((x) => x.slug !== slug).slice(0, 3);
  const html = await marked.parse(a.body);

  return (
    <article>
      <div className="relative h-[60vh] bg-navy">
        <img src={a.image} alt={a.titre} className="absolute inset-0 w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 text-ivory">
          <div className="max-w-4xl mx-auto px-6 pb-14">
            <Link href="/actualites" className="text-ivory/60 text-sm">← Actualités</Link>
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] mt-6">
              <span className="text-gold">{a.rubrique}</span>
              <span className="text-ivory/40">·</span>
              <span className="text-ivory/60">{formatDate(a.date)}</span>
              <span className="text-ivory/40">·</span>
              <span className="text-ivory/60">{a.duree_lecture} min</span>
            </div>
            <h1 className="font-serif text-4xl md:text-6xl mt-4 leading-[1.05]">{a.titre}</h1>
            <p className="text-ivory/80 text-lg md:text-xl mt-6 max-w-3xl leading-relaxed">{a.chapo}</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-sm text-muted pb-8 border-b border-ink/10">Par <span className="text-navy font-medium">{a.auteur}</span> · Conseiller iad · Mont d'Or & Ouest lyonnais</div>

        <div
          className="mt-10 prose-article"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>

      <section className="bg-ivory-deep py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-serif text-4xl md:text-5xl mb-10">À lire aussi</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {others.map((o) => (
              <Link key={o.slug} href={`/actualites/${o.slug}`} className="group">
                <div className="aspect-[4/3] overflow-hidden bg-white rounded-xl">
                  <img src={o.image} alt={o.titre} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                </div>
                <div className="pt-4">
                  <div className="text-xs uppercase tracking-widest text-gold">{o.rubrique}</div>
                  <h3 className="font-serif text-xl mt-2 text-navy group-hover:text-gold transition leading-tight">{o.titre}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}
