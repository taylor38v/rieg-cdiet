import { RecordEditor } from "../Editors";

// Ordre logique des pages (les plus utilisées d'abord).
const ORDRE = [
  "home", "vendre", "acheter", "location", "avis-de-valeur", "rejoindre",
  "contact", "honoraires", "a-propos", "outils-landing", "secteurs-landing",
  "outils-pages", "confidentialite", "mentions-legales", "merci",
];

export default function Page() {
  return (
    <RecordEditor
      table="site"
      titre="Pages du site"
      description="Choisissez une page, puis modifiez ses textes. Les champs marqués d'un triangle se déplient."
      ordre={ORDRE}
    />
  );
}
