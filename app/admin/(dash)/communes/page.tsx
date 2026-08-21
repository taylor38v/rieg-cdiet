import { RecordEditor } from "../Editors";

export default function Page() {
  return (
    <RecordEditor
      table="secteurs"
      titre="Fiches communes"
      description="Prix au m², délais, quartiers, écoles, restaurants, associations, photos et vidéos de chaque commune."
      labelField="nom"
    />
  );
}
