import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { marked } from "marked";
import { formatPrix } from "../../lib/format";
import { getSecteurs, getSecteursDetails, getZonesContent } from "../../lib/content";
import CityMap from "../../components/CityMap";
import HeroBackground from "../../components/HeroBackground";
import ContactButtons from "../../components/ContactButtons";
import ContactCTA from "../../components/ContactCTA";
import { findZone } from "../../lib/territoire";

const inline = (s: string) => marked.parseInline(s) as string;

// Slugs des communes ayant une fiche dédiée /secteurs/{slug}
const COMMUNE_TO_SLUG: Record<string, string> = {
  "Saint-Didier-au-Mont-d'Or": "saint-didier-au-mont-dor",
  "Saint-Cyr-au-Mont-d'Or": "saint-cyr-au-mont-dor",
  "Écully": "ecully",
  "Dardilly": "dardilly",
  "Limonest": "limonest",
  "Champagne-au-Mont-d'Or": "champagne-au-mont-dor",
  "Saint-Just-Saint-Rambert": "saint-just-saint-rambert",
  "Andrézieux-Bouthéon": "andrezieux-boutheon",
  "Lyon": "lyon",
  "Caluire-et-Cuire": "caluire-et-cuire",
  "Collonges-au-Mont-d'Or": "collonges-au-mont-dor",
  "Poleymieux-au-Mont-d'Or": "poleymieux-au-mont-dor",
  "Curis-au-Mont-d'Or": "curis-au-mont-dor",
  "Couzon-au-Mont-d'Or": "couzon-au-mont-dor",
  "Albigny-sur-Saône": "albigny-sur-saone",
  "Chasselay": "chasselay",
  "Lissieu": "lissieu",
  "Marcilly-d'Azergues": "marcilly-d-azergues",
  "Chazay-d'Azergues": "chazay-d-azergues",
  "Tassin-la-Demi-Lune": "tassin-la-demi-lune",
  "Charbonnières-les-Bains": "charbonnieres-les-bains",
  "Craponne": "craponne",
  "Francheville": "francheville",
  "Civrieux-d'Azergues": "civrieux-d-azergues",
  "Lozanne": "lozanne",
  "Dommartin": "dommartin",
  "Fontaines-sur-Saône": "fontaines-sur-saone",
  "Sainte-Foy-lès-Lyon": "sainte-foy-les-lyon",
  "Villeurbanne": "villeurbanne",
  "Saint-Genis-les-Ollières": "saint-genis-les-ollieres",
  "Saint-Étienne": "saint-etienne",
  "Bonson": "bonson",
  "Chambles": "chambles",
  "Saint-Marcellin-en-Forez": "saint-marcellin-en-forez",
  "Saint-Cyprien": "saint-cyprien",
  "Sury-le-Comtal": "sury-le-comtal",
  "Veauchette": "veauchette",
  "Veauche": "veauche",
  "Unieux": "unieux",
  "La Fouillouse": "la-fouillouse",
  "Saint-Romain-le-Puy": "saint-romain-le-puy",
  "Roche-la-Molière": "roche-la-moliere",
  "Firminy": "firminy",
  "Villars": "villars",
  "Saint-Priest-en-Jarez": "saint-priest-en-jarez",
  "L'Étrat": "l-etrat",
  "La Tour-en-Jarez": "la-tour-en-jarez",
  "Saint-Héand": "saint-heand",
  "Saint-Bonnet-les-Oules": "saint-bonnet-les-oules",
  "Saint-Galmier": "saint-galmier",
  "Chambœuf": "chamboeuf",
  "Montrond-les-Bains": "montrond-les-bains",
  "Feurs": "feurs",
  "Saint-Romain-au-Mont-d'Or": "saint-romain-au-mont-dor",
};

// Communes ayant une fiche complète (avec contenu rédigé)
const COMMUNES_WITH_FICHE = new Set([
  "saint-didier-au-mont-dor",
  "saint-cyr-au-mont-dor",
  "ecully",
  "dardilly",
  "limonest",
  "champagne-au-mont-dor",
  "saint-just-saint-rambert",
  "andrezieux-boutheon",
]);

function CommuneLink({ nom, className }: { nom: string; className?: string }) {
  const slug = COMMUNE_TO_SLUG[nom];
  if (slug && COMMUNES_WITH_FICHE.has(slug)) {
    return <Link href={`/secteurs/${slug}`} className={`${className || ""} hover:bg-gold hover:text-navy transition`}>{nom}</Link>;
  }
  return <span className={className}>{nom}</span>;
}

const COMMUNES_BY_ZONE: Record<string, { mapSlugs: string[]; communes: string[]; zoneFilter?: "mont-dor" | "forez" }> = {
  "saint-didier": { mapSlugs: ["saint-didier-au-mont-dor"], communes: ["saint-didier-au-mont-dor"] },
  "ouest-lyonnais": { mapSlugs: [], zoneFilter: "mont-dor", communes: ["saint-didier-au-mont-dor", "saint-cyr-au-mont-dor", "ecully", "dardilly", "limonest", "champagne-au-mont-dor"] },
  "plaine-du-forez": { mapSlugs: [], zoneFilter: "forez", communes: ["saint-just-saint-rambert", "andrezieux-boutheon"] },
};

const etapes = [
  ["01", "Premier contact & collecte d'infos", "Formulaire ou contact direct par téléphone/email. Collecte des informations sur votre bien et votre projet."],
  ["02", "Visite & avis de valeur précis", "Avis de valeur fiable basé sur les ventes récentes, les caractéristiques du bien et les tendances locales."],
  ["03", "Mise en vente optimale", "Publication sur les portails principaux. Diffusion auprès du réseau iad (+15 000 conseillers). Photos UltraHD, drone si nécessaire."],
  ["04", "Suivi jusqu'à la signature", "Visites, filtrage des acquéreurs, négociation, suivi administratif jusqu'au notaire."],
];

export async function generateStaticParams() {
  const zonesContent = await getZonesContent();
  return Object.keys(zonesContent).map((z) => ({ zone: z }));
}

export async function generateMetadata(props: PageProps<"/vendre/[zone]">): Promise<Metadata> {
  const { zone } = await props.params;
  const zonesContent = await getZonesContent();
  const z = (zonesContent as Record<string, any>)[zone];
  if (!z) return {};
  return { title: z.titre_seo, description: z.meta_description ?? z.intro?.[0] };
}

export default async function Page(props: PageProps<"/vendre/[zone]">) {
  const { zone } = await props.params;
  const zonesContent = await getZonesContent();
  const z = (zonesContent as Record<string, any>)[zone];
  if (!z) notFound();

  const secteurs = await getSecteurs();
  const secteursDetails = await getSecteursDetails();
  const meta = COMMUNES_BY_ZONE[zone] || { mapSlugs: [], communes: [] };
  const communesData = meta.communes.map((slug) => secteurs.find((s) => s.slug === slug)).filter(Boolean);
  const territoire = findZone(zone);

  // Tous les libellés/textes de la page sont éditables via le CMS (content/zones/*.json),
  // avec une valeur par défaut si le champ n'est pas renseigné.
  const ui = {
    heroSurtitre: z.hero_surtitre ?? "Mon secteur d'intervention",
    retourLabel: z.retour_label ?? "← Vendre",
    heroCtaLabel: z.hero_cta_label ?? "Me contacter",
    heroReassurance: z.hero_reassurance ?? "Zéro engagement · 100% confidentiel",
    atoutsSurtitre: z.atouts_surtitre ?? "Pourquoi me confier votre bien ?",
    atoutsTitre: z.atouts_titre ?? "Trois atouts qui font la différence.",
    processSurtitre: z.process_surtitre ?? "Le processus",
    processTitre: z.process_titre ?? "Quatre étapes claires.",
    carteSurtitre: z.carte_surtitre ?? "Les communes",
    carteTitre: z.carte_titre ?? "Survolez la carte pour explorer.",
    carteTexte: z.carte_texte ?? "Cliquez sur une commune pour ouvrir sa fiche détaillée - démographie, écoles, restaurants, quartiers, prix au m².",
    ctaTitre: z.cta_titre ?? "Et si on commençait par un avis de valeur ?",
    ctaIntro: z.cta_intro ?? "Offert, argumenté, sous 24 - 48h - sans engagement de mandat.",
  };

  const etapesData: { num: string; titre: string; desc: string }[] =
    Array.isArray(z.etapes) && z.etapes.length
      ? z.etapes
      : etapes.map(([num, titre, desc]) => ({ num, titre, desc }));

  const pos = {
    surtitre: z.positionnement_surtitre ?? "Mon positionnement",
    titre: z.positionnement_titre ?? territoire?.intro ?? "",
    texte: z.positionnement_texte ?? territoire?.positionnement ?? "",
    principalesLabel: z.communes_principales_label ?? "Communes principales",
    principales: (z.communes_principales as string[] | undefined) ?? territoire?.principales ?? [],
    limitrophesLabel: z.limitrophes_label ?? "+ communes limitrophes que je couvre également",
    limitrophes: (z.communes_limitrophes as string[] | undefined) ?? territoire?.limitrophes ?? [],
    limitrophesNote:
      z.limitrophes_note ??
      "Je ne me limite jamais strictement aux communes principales - chaque projet sur les limitrophes est étudié avec la même attention.",
  };
  const showPos = !!(pos.titre || pos.principales.length);

  return (
    <>
      <section className="relative text-ivory py-32 overflow-hidden bg-navy">
        <HeroBackground video={z.video || undefined} images={z.image ? [z.image] : undefined} overlay={0.65} />
        <div className="relative max-w-7xl mx-auto px-6">
          <Link href="/vendre" className="text-ivory/60 text-sm">{ui.retourLabel}</Link>
          <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium mt-6">{ui.heroSurtitre}</div>
          <h1 className="font-serif text-4xl md:text-6xl mt-3 leading-[1.1] max-w-4xl">{z.h1}</h1>
          <div className="text-ivory/80 text-lg mt-8 max-w-3xl space-y-3 leading-relaxed">
            {z.intro.map((p: string, i: number) => <p key={i} dangerouslySetInnerHTML={{ __html: inline(p) }} />)}
            {z.intro_complement && <p dangerouslySetInnerHTML={{ __html: inline(z.intro_complement) }} />}
          </div>
          <div className="text-xs uppercase tracking-widest text-gold mt-8">{z.communes_label}</div>
          <div className="flex flex-wrap gap-4 mt-8">
            <Link href="/contact" className="px-7 py-4 bg-gold text-navy font-semibold hover:bg-gold-soft rounded-full transition shadow-md">{ui.heroCtaLabel}</Link>
            <ContactButtons smsBody={`Bonjour Romain, je souhaite un avis sur ${z.h1.toLowerCase()}. `} mailSubject={`Avis ${territoire?.nom || zone}`} />
          </div>
          <div className="mt-4 text-xs text-ivory/60">{ui.heroReassurance}</div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">{ui.atoutsSurtitre}</div>
        <h2 className="font-serif text-3xl md:text-4xl mt-3">{ui.atoutsTitre}</h2>
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {z.atouts.map((a: { titre: string; desc: string }, i: number) => (
            <div
              key={i}
              className="group relative shine-hover rounded-xl p-7 bg-white border border-ink/10 hover:border-gold transition-all duration-300 overflow-hidden hover:-translate-y-1 hover:shadow-2xl hover:shadow-gold/20"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold/5 rounded-full blur-3xl group-hover:bg-gold/20 transition" />
              <div className="relative">
                <div className="inline-flex w-12 h-12 rounded-full bg-gradient-to-br from-gold to-gold-soft text-navy items-center justify-center font-serif text-xl font-bold shadow-lg">0{i + 1}</div>
                <div className="font-serif text-xl text-navy mt-4 font-semibold group-hover:text-gold transition" dangerouslySetInnerHTML={{ __html: inline(a.titre) }} />
                <p className="text-sm text-muted mt-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: inline(a.desc) }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-navy text-ivory py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">{ui.processSurtitre}</div>
          <h2 className="font-serif text-3xl md:text-4xl mt-3">{ui.processTitre}</h2>

          <div className="mt-16 relative">
            <div className="absolute left-7 top-8 bottom-8 w-px bg-gradient-to-b from-gold via-gold/30 to-gold/0 hidden md:block" />
            <div className="space-y-6">
              {etapesData.map((e, i) => (
                <div
                  key={e.num || i}
                  className="group relative rounded-xl shine-hover bg-navy-soft border border-ivory/10 hover:border-gold p-6 md:pl-20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-gold/10"
                >
                  <div className="flex items-start gap-4 md:block">
                    <div className="shrink-0 md:absolute md:left-2 md:top-6 w-12 h-12 rounded-full bg-gold text-navy font-serif text-xl font-bold grid place-items-center shadow-lg group-hover:scale-110 transition">
                      {e.num}
                    </div>
                    <div>
                      <div className="font-serif text-2xl group-hover:text-gold transition" dangerouslySetInnerHTML={{ __html: inline(e.titre) }} />
                      <div className="text-ivory/75 mt-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: inline(e.desc) }} />
                    </div>
                  </div>
                  {i < etapesData.length - 1 && (
                    <div className="absolute right-6 bottom-6 text-gold/30 group-hover:text-gold transition text-2xl">↓</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {showPos && (
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-[1.2fr_2fr] gap-12">
            <div>
              <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">{pos.surtitre}</div>
              <h2 className="font-serif text-4xl md:text-5xl mt-3 leading-tight" dangerouslySetInnerHTML={{ __html: inline(pos.titre) }} />
              <p className="text-muted mt-5 leading-relaxed" dangerouslySetInnerHTML={{ __html: inline(pos.texte) }} />
            </div>
            <div>
              <div className="text-sm md:text-base uppercase tracking-[0.25em] text-gold font-semibold mb-4">{pos.principalesLabel}</div>
              <div className="flex flex-wrap gap-2">
                {pos.principales.map((c) => (
                  <CommuneLink key={c} nom={c} className="px-4 py-2 bg-navy text-ivory text-sm rounded-full font-medium shadow-md hover:shadow-lg transition" />
                ))}
              </div>
              {pos.limitrophes.length > 0 && (
                <>
                  <div className="text-sm md:text-base uppercase tracking-[0.25em] text-gold font-semibold mb-4 mt-8">{pos.limitrophesLabel}</div>
                  <div className="flex flex-wrap gap-2">
                    {pos.limitrophes.map((c) => (
                      <CommuneLink key={c} nom={c} className="px-3 py-1.5 bg-gold/10 text-navy text-sm border border-gold/40 rounded-full hover:bg-gold hover:border-gold transition" />
                    ))}
                  </div>
                  <p className="text-xs text-muted mt-5 italic">{pos.limitrophesNote}</p>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="bg-ivory-deep py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">{ui.carteSurtitre}</div>
          <h2 className="font-serif text-4xl md:text-5xl mt-3">{ui.carteTitre}</h2>
          <p className="text-muted mt-3 max-w-2xl">{ui.carteTexte}</p>
          <div className="mt-10">
            {meta.zoneFilter ? (
              <CityMap height={520} zoneFilter={meta.zoneFilter} includeLimitrophes showLegend />
            ) : (
              <CityMap height={520} slugs={meta.mapSlugs} />
            )}
          </div>

          {communesData.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
              {communesData.map((s) => {
                if (!s) return null;
                // Vignette éditable via le CMS : 1re photo de la Galerie de la commune, sinon image par défaut.
                const vignette = secteursDetails[s.slug]?.galerie?.[0] ?? s.image;
                return (
                <Link key={s.slug} href={`/secteurs/${s.slug}`} className="group bg-white border border-ink/10 hover:border-navy block rounded-xl overflow-hidden">
                  {vignette && (
                    <div className="aspect-[16/9] overflow-hidden">
                      <img src={vignette} alt={s.nom} className="no-round w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="font-serif text-2xl text-navy group-hover:text-gold transition">{s.nom}</div>
                    <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
                      <div><div className="text-muted">Maison</div><div className="font-serif text-navy">{formatPrix(s.prixM2Maison)}</div></div>
                      <div><div className="text-muted">Appart.</div><div className="font-serif text-navy">{formatPrix(s.prixM2Appart)}</div></div>
                      <div><div className="text-muted">Délai</div><div className="font-serif text-navy">{s.delaiVente} j</div></div>
                    </div>
                  </div>
                </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <ContactCTA
        variant="ivory"
        titre={ui.ctaTitre}
        intro={ui.ctaIntro}
        smsBody={`Bonjour Romain, je souhaite un avis de valeur dans le secteur ${territoire?.nom || ""}. `}
        mailSubject={`Avis de valeur - ${territoire?.nom || ""}`}
      />
    </>
  );
}
