import Link from "next/link";

type Props = {
  variant?: "wide" | "side";
  titre?: string;
  message?: string;
};

export default function RomainCard({
  variant = "wide",
  titre = "Parlons de votre projet, ensemble.",
  message = "Conseiller immobilier iad, je vous accompagne personnellement de la première rencontre jusqu'à la signature notariale. Pas d'intermédiaire, pas de standard - vous m'appelez, je réponds.",
}: Props) {
  if (variant === "side") {
    return (
      <div className="rounded-xl bg-ivory-deep p-6 flex gap-5 items-center border border-ink/10">
        <img src="/photos/romain-pro.jpg" alt="Romain Rieg" className="w-20 h-20 rounded-full object-cover shrink-0 border-2 border-gold" />
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-[0.3em] text-gold">Romain Rieg</div>
          <div className="font-serif text-lg text-navy mt-1 leading-snug">{titre}</div>
          <div className="flex flex-wrap gap-2 mt-3">
            <a href="tel:+33679571473" className="text-xs px-3 py-1.5 bg-navy text-ivory hover:bg-gold hover:text-navy rounded-full">06 79 57 14 73</a>
            <a href="sms:+33679571473" className="text-xs px-3 py-1.5 bg-gold text-navy rounded-full">SMS</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="rounded-xl grid lg:grid-cols-[auto_1fr] gap-10 items-center bg-ivory-deep p-8 lg:p-12 border border-ink/10">
        <div className="shrink-0 mx-auto lg:mx-0">
          <div className="w-44 h-44 lg:w-56 lg:h-56 overflow-hidden rounded-full border-4 border-gold/40">
            <img src="/photos/romain-pro.jpg" alt="Romain Rieg, conseiller iad Prestige" className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="text-center lg:text-left">
          <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">Romain Rieg · Conseiller immobilier iad</div>
          <h2 className="font-serif text-4xl md:text-5xl text-navy mt-3 leading-tight">{titre}</h2>
          <p className="text-muted mt-4 leading-relaxed max-w-2xl mx-auto lg:mx-0">{message}</p>
          <div className="flex flex-wrap justify-center lg:justify-start gap-3 mt-6">
            <a href="tel:+33679571473" className="px-5 py-3 bg-navy text-ivory rounded-full hover:bg-gold hover:text-navy text-sm rounded-full">06 79 57 14 73</a>
            <a href="sms:+33679571473" className="px-5 py-3 bg-gold text-navy rounded-full hover:bg-gold-soft text-sm">💬 SMS</a>
            <Link href="/contact" className="px-5 py-3 border border-navy text-navy hover:bg-navy hover:text-ivory text-sm transition rounded-full">Me rencontrer</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
