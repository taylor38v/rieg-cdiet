"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { zones } from "../lib/territoire";
import { useSettings } from "../lib/ClientData";
import NewsletterForm from "./NewsletterForm";

const IAD_MINISITE = "https://www.iadfrance.fr/conseiller-immobilier/romain.rieg";

// Met en or chaque segment listé, où qu'il soit dans la phrase (segments éditables via le CMS).
function highlight(text: string, segments: string[]) {
  if (!segments.length) return text;
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Le plus long d'abord : évite qu'un segment court "mange" un segment plus long qui le contient.
  const ordered = [...segments].sort((a, b) => b.length - a.length);
  const re = new RegExp(`(${ordered.map(esc).join("|")})`, "g");
  return text.split(re).map((part, i) =>
    segments.includes(part) ? (
      <span key={i} className="text-gold">{part}</span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

// Communes qui ont une fiche dédiée → lien interne
const COMMUNE_SLUGS: Record<string, string> = {
  "Saint-Didier-au-Mont-d'Or": "saint-didier-au-mont-dor",
  "Saint-Cyr-au-Mont-d'Or": "saint-cyr-au-mont-dor",
  "Écully": "ecully",
  "Dardilly": "dardilly",
  "Limonest": "limonest",
  "Champagne-au-Mont-d'Or": "champagne-au-mont-dor",
  "Saint-Just-Saint-Rambert": "saint-just-saint-rambert",
  "Andrézieux-Bouthéon": "andrezieux-boutheon",
  "Saint-Étienne": "saint-etienne",
  "Lyon": "lyon",
  "Villeurbanne": "villeurbanne",
  "Sainte-Foy-lès-Lyon": "sainte-foy-les-lyon",
  "Fontaines-sur-Saône": "fontaines-sur-saone",
  "Saint-Genis-les-Ollières": "saint-genis-les-ollieres",
  "Chambœuf": "chamboeuf",
};

function CommuneLink({ nom, className }: { nom: string; className?: string }) {
  const slug = COMMUNE_SLUGS[nom];
  if (slug) {
    return (
      <Link href={`/secteurs/${slug}`} className={`hover:text-gold transition ${className || ""}`}>
        {nom}
      </Link>
    );
  }
  // Pas de fiche dédiée → texte brut, non cliquable (à activer quand la page sera créée)
  return <span className={className}>{nom}</span>;
}

type Social = { kind: "instagram" | "tiktok" | "linkedin" | "facebook"; href: string; label: string };

function SocialIcon({ kind }: { kind: "instagram" | "tiktok" | "linkedin" | "facebook" }) {
  if (kind === "instagram") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2.2c3.2 0 3.6 0 4.8.07 1.2.05 1.85.25 2.28.42.57.22.98.49 1.4.92.44.43.7.84.93 1.4.17.44.37 1.09.42 2.29.06 1.2.07 1.6.07 4.8s0 3.6-.07 4.8c-.05 1.2-.25 1.85-.42 2.28-.22.57-.49.98-.92 1.4-.43.44-.84.7-1.4.93-.44.17-1.09.37-2.29.42-1.2.06-1.6.07-4.8.07s-3.6 0-4.8-.07c-1.2-.05-1.85-.25-2.28-.42a3.84 3.84 0 0 1-1.4-.92 3.84 3.84 0 0 1-.93-1.4c-.17-.44-.37-1.09-.42-2.29C2.21 15.6 2.2 15.2 2.2 12s0-3.6.07-4.8c.05-1.2.25-1.85.42-2.28.22-.57.49-.98.92-1.4.43-.44.84-.7 1.4-.93.44-.17 1.09-.37 2.29-.42C8.4 2.21 8.8 2.2 12 2.2zm0 2.16c-3.15 0-3.52 0-4.76.06-1.15.05-1.77.24-2.18.4-.55.21-.94.47-1.35.88-.41.41-.67.8-.88 1.35-.16.41-.35 1.03-.4 2.18-.06 1.24-.06 1.61-.06 4.76s0 3.52.06 4.76c.05 1.15.24 1.77.4 2.18.21.55.47.94.88 1.35.41.41.8.67 1.35.88.41.16 1.03.35 2.18.4 1.24.06 1.61.06 4.76.06s3.52 0 4.76-.06c1.15-.05 1.77-.24 2.18-.4.55-.21.94-.47 1.35-.88.41-.41.67-.8.88-1.35.16-.41.35-1.03.4-2.18.06-1.24.06-1.61.06-4.76s0-3.52-.06-4.76c-.05-1.15-.24-1.77-.4-2.18a3.7 3.7 0 0 0-.88-1.35 3.7 3.7 0 0 0-1.35-.88c-.41-.16-1.03-.35-2.18-.4-1.24-.06-1.61-.06-4.76-.06zm0 3.68a3.96 3.96 0 1 1 0 7.92 3.96 3.96 0 0 1 0-7.92zm0 6.53a2.57 2.57 0 1 0 0-5.14 2.57 2.57 0 0 0 0 5.14zm5.04-6.69a.92.92 0 1 1-1.85 0 .92.92 0 0 1 1.85 0z"/>
      </svg>
    );
  }
  if (kind === "tiktok") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.55a8.16 8.16 0 0 0 4.77 1.52V6.69h-1.84z"/>
      </svg>
    );
  }
  if (kind === "linkedin") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45C23.21 24 24 23.23 24 22.28V1.72C24 .77 23.21 0 22.22 0z"/>
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-7H7.9V12h2.54V9.8c0-2.5 1.5-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.88h-2.33v7A10 10 0 0 0 22 12z"/>
    </svg>
  );
}

export default function Footer() {
  const settings = useSettings();
  const zonesPourFooter = zones.filter((z) => z.slug !== "saint-didier");
  const pathname = usePathname();
  const isHome = pathname === "/";

  const SOCIALS: Social[] = [
    ...(settings.instagram ? [{ kind: "instagram" as const, href: settings.instagram, label: "Instagram" }] : []),
    ...(settings.tiktok ? [{ kind: "tiktok" as const, href: settings.tiktok, label: "TikTok" }] : []),
    ...(settings.linkedin ? [{ kind: "linkedin" as const, href: settings.linkedin, label: "LinkedIn" }] : []),
    ...(settings.facebook ? [{ kind: "facebook" as const, href: settings.facebook, label: "Facebook" }] : []),
  ];

  // Texte newsletter : un ou plusieurs segments (zones) sont mis en valeur en or dans la phrase.
  const newsletterFull =
    settings.footer?.newsletter_texte ??
    "Pas de spam - uniquement les nouvelles actualités du marché de l'Ouest lyonnais et de la Plaine du Forez et mes derniers contenus.";
  const goldSegments = (
    settings.footer?.newsletter_zones_gold?.length
      ? settings.footer.newsletter_zones_gold
      : [settings.footer?.newsletter_zone_gold ?? ""]
  ).filter(Boolean);
  const newsletterTexte = highlight(newsletterFull, goldSegments);

  // Copyright : {year} = année courante, {rsac} = numéro RSAC issu de settings.rcs.
  const rsacNumero = settings.rcs.replace(/^RCS Lyon n°\s*/i, "");
  const copyrightText = (
    settings.footer?.copyright ??
    "© {year} Romain Rieg - Tous droits réservés · RSAC de Lyon : {rsac}"
  )
    .replace("{year}", String(new Date().getFullYear()))
    .replace("{rsac}", rsacNumero);

  return (
    <footer className="bg-navy text-ivory">
      {isHome && (
      <div className="bg-navy-soft border-b border-ivory/10">
        <div className="max-w-7xl mx-auto px-6 py-14 grid lg:grid-cols-[auto_1fr] gap-10 items-center">
          <div className="shrink-0">
            <div className="w-32 h-32 lg:w-44 lg:h-44 overflow-hidden rounded-full border-4 border-gold shadow-xl shadow-gold/20 mx-auto lg:mx-0">
              <img src="/photos/romain-pro.jpg" alt="Romain Rieg" className="no-round w-full h-full object-cover" style={{ objectPosition: "center 20%" }} />
            </div>
          </div>
          <div className="text-center lg:text-left">
            <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">{settings.nom}</div>
            <p className="font-serif text-2xl md:text-3xl text-ivory mt-3 leading-snug max-w-3xl text-justify">
              {settings.bio_longue} Que ce soit pour un avis de valeur en <span className="text-gold font-semibold">{settings.delai_avis}</span> ou une stratégie de vente, je mets mon énergie au service de votre projet.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <a href={`tel:${settings.telephone_lien}`} className="px-6 py-3 border-2 border-gold text-gold text-sm font-medium hover:bg-gold hover:text-navy transition rounded-full">{settings.footer?.cta_telephone_label ?? settings.telephone}</a>
              <a href={`sms:${settings.whatsapp}`} className="px-6 py-3 border-2 border-gold text-gold text-sm font-medium hover:bg-gold hover:text-navy transition rounded-full">{settings.footer?.cta_sms_label ?? "SMS direct"}</a>
              <a href={`mailto:${settings.email}`} className="px-6 py-3 border-2 border-gold text-gold text-sm font-medium hover:bg-gold hover:text-navy transition rounded-full">{settings.footer?.cta_mail_label ?? "Mail"}</a>
              <Link href="/contact" className="px-6 py-3 bg-gold text-navy text-sm font-semibold hover:bg-gold-soft transition rounded-full">{settings.footer?.cta_contact_label ?? "Contactez-moi →"}</Link>
            </div>
          </div>
        </div>
      </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-14 grid md:grid-cols-3 gap-10">
        <div>
          <div className="text-xs uppercase tracking-widest text-gold mb-4">{settings.footer?.col_site_titre ?? "Le site"}</div>
          <ul className="space-y-2.5 text-sm text-ivory/85">
            <li><Link href="/rejoindre" className="hover:text-gold">{settings.footer?.lien_rejoindre ?? "Rejoindre mon équipe"}</Link></li>
            <li><Link href="/avis-de-valeur" className="hover:text-gold">{settings.footer?.lien_avis_de_valeur ?? "Avis de valeur"}</Link></li>
            <li><Link href="/vendre" className="hover:text-gold">{settings.footer?.lien_vendre ?? "Vendre"}</Link></li>
            <li><Link href="/acheter" className="hover:text-gold">{settings.footer?.lien_acheter ?? "Acheter / Investir"}</Link></li>
            <li><Link href="/location" className="hover:text-gold">{settings.footer?.lien_location ?? "Location"}</Link></li>
            <li><Link href="/outils" className="hover:text-gold">{settings.footer?.lien_outils ?? "Outils"}</Link></li>
            <li><Link href="/actualites" className="hover:text-gold">{settings.footer?.lien_actualites ?? "Actualités"}</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-xs uppercase tracking-widest text-gold mb-4">{settings.footer?.col_newsletter_titre ?? "Newsletter"}</div>
          <p className="text-sm text-ivory/70 leading-relaxed mb-4">
            {newsletterTexte}
          </p>
          <NewsletterForm
            placeholder={settings.footer?.newsletter_placeholder ?? "Votre email"}
            bouton={settings.footer?.newsletter_bouton ?? "S'abonner"}
          />
        </div>

        <div className="md:text-right">
          <div className="text-xs uppercase tracking-widest text-gold mb-4">{settings.footer?.col_joindre_titre ?? "Me joindre"}</div>
          <ul className="space-y-2.5 text-sm text-ivory/85">
            <li><a href={`tel:${settings.telephone_lien}`} className="hover:text-gold">{settings.telephone}</a></li>
            <li><a href={`sms:${settings.whatsapp}`} className="hover:text-gold">{settings.footer?.lien_sms_label ?? "SMS direct"}</a></li>
            <li><a href={`mailto:${settings.email}`} className="hover:text-gold break-all">{settings.email}</a></li>
            <li><a href={IAD_MINISITE} target="_blank" rel="noopener" className="hover:text-gold">{settings.footer?.lien_iad_label ?? "Mes biens iad ↗"}</a></li>
            <li>{settings.footer?.adresse ?? "Saint-Didier-au-Mont-d'Or (69370)"}</li>
          </ul>
          <div className="flex gap-2 mt-5 md:justify-end">
            {SOCIALS.map((s) => (
              <a
                key={s.kind}
                href={s.href}
                target="_blank"
                rel="noopener"
                aria-label={s.label}
                className="w-9 h-9 grid place-items-center border border-ivory/20 hover:border-gold hover:text-gold rounded-full transition"
              >
                <SocialIcon kind={s.kind} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-ivory/10 bg-navy-soft">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium mb-2">{settings.footer?.secteurs_surtitre ?? "Mes secteurs d'intervention"}</div>
          <h3 className="font-serif text-2xl text-ivory">{settings.footer?.secteurs_titre ?? "Là où j'interviens."}</h3>
          <p className="text-ivory/60 text-sm mt-2 max-w-3xl">{settings.footer?.secteurs_intro ?? "Je couvre les zones ci-dessous ainsi que leurs communes limitrophes - sans m'y limiter strictement."}</p>

          <div className="grid md:grid-cols-2 gap-8 mt-6">
            {zonesPourFooter.map((z) => (
              <div key={z.slug}>
                <Link href={`/vendre/${z.slug}`} className="text-xs uppercase tracking-widest text-gold mb-3 flex items-center gap-2 hover:text-ivory transition">
                  <span className="w-6 h-px bg-gold" /> {z.nom}
                </Link>
                <div className="text-ivory/85 text-sm font-medium mb-3 mt-3">
                  {z.principales.map((c, i) => (
                    <span key={c}>
                      {i > 0 && " · "}
                      <CommuneLink nom={c} />
                    </span>
                  ))}
                </div>
                {z.limitrophes.length > 0 && (
                  <div className="text-ivory/55 text-xs leading-relaxed">
                    <span className="text-gold/70">{settings.footer?.limitrophes_label ?? "Limitrophes : "}</span>
                    {z.limitrophes.map((c, i) => (
                      <span key={c}>
                        {i > 0 && " · "}
                        <CommuneLink nom={c} />
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-ivory/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row justify-between gap-2 text-xs text-ivory/50">
          <div>{copyrightText}</div>
          <div className="flex gap-5 mt-2 md:mt-0">
            <Link href="/mentions-legales" className="hover:text-gold">{settings.footer?.lien_mentions_legales ?? "Mentions légales"}</Link>
            <Link href="/confidentialite" className="hover:text-gold">{settings.footer?.lien_confidentialite ?? "Confidentialité"}</Link>
            <Link href="/contact" className="hover:text-gold">{settings.footer?.lien_contact ?? "Contact"}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
