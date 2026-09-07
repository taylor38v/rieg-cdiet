import { WholeEditor } from "../Editors";

export default function Page() {
  return (
    <WholeEditor
      table="territoire"
      titre="Communes (footer et cartes)"
      description="« Zones » : les listes de communes affichées dans le pied de page (Là où j'interviens). « Carte » : les communes coloriées sur les cartes interactives (primaire ou limitrophe, secteur Mont d'Or ou Forez)."
    />
  );
}
