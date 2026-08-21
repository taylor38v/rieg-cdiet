import Link from "next/link";
import { getSiteContent } from "./lib/content";

export default async function NotFound() {
  const site = await getSiteContent();
  const nf = site["not-found"];
  return (
    <div className="min-h-[70vh] flex items-center">
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">{nf.surtitre}</div>
        <div className="font-serif text-[10rem] leading-none text-navy mt-6">{nf.code}</div>
        <h1 className="font-serif text-4xl md:text-5xl mt-4 text-navy">{nf.titre}</h1>
        <p className="text-muted mt-6 max-w-xl mx-auto leading-relaxed">{nf.intro}</p>
        <div className="flex flex-wrap justify-center gap-4 mt-10">
          <Link href={nf.cta_primary_href} className="px-7 py-4 bg-navy text-ivory hover:bg-navy-soft rounded-full">{nf.cta_primary_label}</Link>
          <a href={nf.cta_secondary_url} target="_blank" rel="noopener" className="px-7 py-4 border border-navy text-navy hover:bg-navy hover:text-ivory transition rounded-full">{nf.cta_secondary_label}</a>
        </div>
      </div>
    </div>
  );
}
