"use client";
import ContactButtons from "./ContactButtons";
import { useSettings } from "../lib/ClientData";

type Props = {
  titre?: string;
  intro?: string;
  /** Sujet pré-rempli pour le bouton Mail */
  mailSubject?: string;
  /** Body pré-rempli pour le bouton SMS */
  smsBody?: string;
  /** Conservé pour compat — le fond est désormais unique (bleu secteurs d'intervention) */
  variant?: "ivory" | "navy";
};

/**
 * Fond unique : le bleu "navy-soft" de la section "Mes secteurs d'intervention"
 * du footer — neutre, cohérent partout, et nettement distinct des sections claires
 * au-dessus. Un filet doré en haut marque la séparation même quand la section
 * précédente est elle aussi sombre.
 */
export default function ContactCTA({
  titre,
  intro,
  mailSubject,
  smsBody,
}: Props) {
  const settings = useSettings();
  // Les props passées par les pages restent prioritaires ; sinon valeurs par défaut éditables au CMS.
  const titreFinal = titre ?? settings.cta?.titre ?? "Une question, un projet ?";
  const introFinal =
    intro ??
    settings.cta?.intro ??
    "Romain répond personnellement sous 24 h. Aucune sollicitation commerciale, aucune liste de prospection.";
  return (
    <section className="bg-navy-soft text-ivory py-16 border-t border-gold/25">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h3 className="font-serif text-3xl text-ivory">{titreFinal}</h3>
        <p className="text-ivory/70 mt-3 max-w-2xl mx-auto">{introFinal}</p>
        <div className="mt-6 flex justify-center">
          <ContactButtons
            withContact
            align="center"
            mailSubject={mailSubject}
            smsBody={smsBody}
          />
        </div>
      </div>
    </section>
  );
}
