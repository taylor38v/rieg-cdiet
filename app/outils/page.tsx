import Link from "next/link";
import type { Metadata } from "next";
import { marked } from "marked";
import ContactCTA from "../components/ContactCTA";
import { getSiteContent } from "../lib/content";

const inline = (s: string) => marked.parseInline(s) as string;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent();
  const ol = site["outils-landing"];
  return {
    title: ol.meta_title,
    description: ol.meta_description,
  };
}

type Outil = { href: string; chiffre: string; sub: string; titre: string; desc: string };

// Valeurs d'origine : servent de secours si la liste n'est pas renseignée dans le CMS.
const GROUPES_DEFAUT: { titre: string; outils: Outil[] }[] = [
  {
    titre: "Visualiser le marché",
    outils: [
      { href: "/outils/carte-prix", chiffre: "01", sub: "Carte interactive", titre: "Combien vaut le m² près de chez moi ?", desc: "Carte des 7 communes avec prix moyens maison & appartement, et évolution sur 5 ans." },
    ],
  },
  {
    titre: "Pour décider d'acheter",
    outils: [
      { href: "/outils/capacite-achat", chiffre: "02", sub: "Capacité d'achat", titre: "Combien puis-je acheter au Mont d'Or ?", desc: "À partir de votre revenu et de votre apport, votre budget réel et la surface accessible commune par commune." },
      { href: "/outils/acheter-vs-louer", chiffre: "03", sub: "Achat vs location", titre: "Acheter ou louer sur 10 ans ?", desc: "Comparaison financière complète intégrant frais de notaire, intérêts, valorisation et placement alternatif de l'apport." },
      { href: "/outils/frais-notaire", chiffre: "04", sub: "Frais de notaire détaillés", titre: "Combien me coûteront les frais de notaire ?", desc: "Calcul précis pour le Rhône (69) et la Loire (42), neuf vs ancien, avec déduction du mobilier." },
    ],
  },
  {
    titre: "Pour préparer une vente",
    outils: [
      { href: "/outils/vendabilite", chiffre: "05", sub: "Score de vendabilité", titre: "Mon bien va-t-il se vendre vite et bien ?", desc: "Score sur 100 + diagnostic en 3 points sur prix, DPE et tension de marché. Outil indicatif - un avis de valeur officiel reste indispensable." },
      { href: "/outils/projection", chiffre: "06", sub: "Projection plus-value", titre: "Combien vaudra mon bien dans 5 ans ?", desc: "Sur la base de l'historique DVF de votre quartier. Outil indicatif - projections non garanties." },
      { href: "/outils/dpe-express", chiffre: "07", sub: "Diagnostic énergétique", titre: "Quel est le DPE probable de mon bien ?", desc: "Estimation rapide + plan de travaux pour passer en classe C ou B avant la vente." },
    ],
  },
  {
    titre: "Pour investir",
    outils: [
      { href: "/outils/rentabilite-locative", chiffre: "08", sub: "Rentabilité locative", titre: "Quel rendement vais-je obtenir ?", desc: "Brut, net, cash-flow mensuel et patrimoine constitué sur 20 ans, fiscalité incluse." },
    ],
  },
];

export default async function Page() {
  const site = await getSiteContent();
  const ol = site["outils-landing"];
  // Les rectangles (titre du groupe, sous-titre, titre et description de chaque outil) sont éditables au CMS.
  const groupes: { titre: string; outils: Outil[] }[] =
    (ol as { groupes?: readonly unknown[] }).groupes?.length
      ? ((ol as any).groupes as { titre: string; outils: Outil[] }[])
      : GROUPES_DEFAUT;
  const lienLabel = (ol as any).outil_lien_label ?? "Ouvrir l'outil";

  return (
    <>
    <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
      <div className="max-w-3xl">
        <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">{ol.surtitre}</div>
        <h1 className="font-serif text-3xl md:text-4xl mt-3">{ol.titre}</h1>
        <p className="text-muted mt-6 leading-relaxed" dangerouslySetInnerHTML={{ __html: inline(ol.intro) }} />
        {ol.intro_complement && <p className="text-muted mt-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: inline(ol.intro_complement) }} />}
        <p className="text-xs text-muted mt-4 italic">{ol.disclaimer}</p>
      </div>

      {groupes.map((g) => (
        <section key={g.titre} className="mt-20">
          <div className="flex items-baseline gap-4 mb-6">
            <div className="font-serif text-3xl text-navy">{g.titre}</div>
            <div className="flex-1 border-t border-ink/10" />
            <div className="text-xs uppercase tracking-widest text-muted">{g.outils.length} outil{g.outils.length > 1 ? "s" : ""}</div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {g.outils.map((o) => (
              <Link
                key={o.href}
                href={o.href}
                className="group block rounded-xl p-7 border border-ink/10 hover:border-gold bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-gold/20 overflow-hidden relative"
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold/5 rounded-full blur-3xl group-hover:bg-gold/20 transition" />
                <div className="relative flex items-start gap-5">
                  <div className="font-serif text-4xl text-gold leading-none">{o.chiffre}</div>
                  <div className="flex-1">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-muted">{o.sub}</div>
                    <h2 className="font-serif text-xl text-navy mt-1 group-hover:text-gold transition leading-tight">{o.titre}</h2>
                    <p className="text-sm text-muted mt-3 leading-relaxed">{o.desc}</p>
                    <span className="inline-flex items-center gap-1 text-xs text-navy group-hover:text-gold mt-4 font-semibold uppercase tracking-widest transition">
                      {lienLabel}
                      <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}

    </div>

    <ContactCTA
      variant="ivory"
      titre={ol.cta_titre}
      intro={ol.cta_intro}
      smsBody="Bonjour Romain, j'aimerais en discuter directement. "
      mailSubject="Question depuis vos outils"
    />
    </>
  );
}
