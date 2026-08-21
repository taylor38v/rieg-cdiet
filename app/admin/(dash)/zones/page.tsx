import { RecordEditor } from "../Editors";

export default function Page() {
  return (
    <RecordEditor
      table="zones"
      titre="Zones de vente"
      description="Contenu des pages de zone (Ouest lyonnais, Plaine du Forez, Saint-Didier)."
      labelField="nom"
    />
  );
}
