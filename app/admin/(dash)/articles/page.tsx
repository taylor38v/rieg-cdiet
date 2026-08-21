"use client";
import { ListEditor } from "../Editors";

export default function Page() {
  return (
    <ListEditor
      table="articles"
      titre="Articles"
      description="Rédigez et publiez vos articles. Le champ « publie » décoché garde l'article en brouillon."
      labelField="titre"
      gabarit={() => ({
        titre: "Nouvel article",
        slug: "nouvel-article",
        chapo: "",
        rubrique: "Actualités",
        date: "2026-01-01",
        duree_lecture: 4,
        auteur: "Romain Rieg",
        image: "",
        publie: true,
        body: "",
      })}
    />
  );
}
