// Type des fiches communes. La donnée vit dans content.ts (getSecteursDetails(),
// lecture Blobs) ; côté client, via le hook useSecteursDetails().
export type SecteurDetail = {
  nom?: string;
  meta_title?: string;
  meta_description?: string;
  intro?: string;
  population: number;
  superficie: number;
  cp: string;
  intercommunalite: string;
  altitude?: string;
  prix_m2_maison?: number;
  prix_m2_appartement?: number;
  delai_vente?: number;
  ce_qui_differencie: (string | { titre?: string; description?: string })[];
  ecoles: { nom: string; type: string; precision?: string }[];
  restaurants: { nom: string; cuisine: string; gamme: string; note?: number }[];
  associations: { nom: string; activite: string }[];
  quartiers: { nom: string; description: string; prix_indicatif?: string }[];
  evolution_prix: { annee: number; prixM2: number; prix_appartement?: number }[];
  video_insta?: { titre: string; duree: string; thumb?: string };
  galerie?: string[];
  video?: string;
  video_visite?: string;
  hero_position?: string;
  instagram_url?: string;
};
