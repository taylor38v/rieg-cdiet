export type Zone = {
  slug: string;
  nom: string;
  intro: string;
  positionnement: string;
  principales: string[];
  limitrophes: string[];
  emoji?: string;
};

export const zones: Zone[] = [
  {
    slug: "saint-didier",
    nom: "Saint-Didier-au-Mont-d'Or",
    intro: "Ma commune de résidence - présence quotidienne sur le terrain.",
    positionnement: "C'est ici que je vis et que je connais chaque rue. Mes mandats principaux se font cependant sur les communes alentour de l'Ouest lyonnais, où le marché est plus dynamique.",
    principales: ["Saint-Didier-au-Mont-d'Or"],
    limitrophes: [
      "Champagne-au-Mont-d'Or",
      "Limonest",
      "Saint-Cyr-au-Mont-d'Or",
      "Saint-Romain-au-Mont-d'Or",
      "Curis-au-Mont-d'Or",
      "Poleymieux-au-Mont-d'Or",
    ],
  },
  {
    slug: "ouest-lyonnais",
    nom: "Ouest lyonnais",
    intro: "Mon cœur d'activité - un marché tendu, exigeant, que je couvre au quotidien.",
    positionnement: "Mon expertise principale : 5 communes de référence + l'ensemble de leurs communes limitrophes. Mon réseau iad couvre toute la couronne Ouest de la Métropole de Lyon.",
    principales: ["Saint-Didier-au-Mont-d'Or", "Saint-Cyr-au-Mont-d'Or", "Écully", "Dardilly", "Limonest", "Champagne-au-Mont-d'Or"],
    limitrophes: [
      "Lyon",
      "Caluire-et-Cuire",
      "Collonges-au-Mont-d'Or",
      "Poleymieux-au-Mont-d'Or",
      "Curis-au-Mont-d'Or",
      "Couzon-au-Mont-d'Or",
      "Albigny-sur-Saône",
      "Chasselay",
      "Lissieu",
      "Marcilly-d'Azergues",
      "Chazay-d'Azergues",
      "Tassin-la-Demi-Lune",
      "Charbonnières-les-Bains",
      "Craponne",
      "Francheville",
      "Civrieux-d'Azergues",
      "Lozanne",
      "Dommartin",
      "Fontaines-sur-Saône",
      "Sainte-Foy-lès-Lyon",
      "Villeurbanne",
      "Saint-Genis-les-Ollières",
    ],
  },
  {
    slug: "plaine-du-forez",
    nom: "Plaine du Forez",
    intro: "Saint-Just-Saint-Rambert prioritaire - mon territoire d'enfance, où j'ai vécu 20 ans.",
    positionnement: "Saint-Just-Saint-Rambert reste mon point d'ancrage prioritaire dans la Loire. J'interviens également sur Andrézieux-Bouthéon et l'ensemble des communes limitrophes.",
    principales: ["Saint-Just-Saint-Rambert", "Andrézieux-Bouthéon"],
    // Andrézieux et Saint-Just ont une fiche /secteurs/{slug}

    limitrophes: [
      "Saint-Étienne",
      "Bonson",
      "Chambles",
      "Saint-Marcellin-en-Forez",
      "Saint-Cyprien",
      "Sury-le-Comtal",
      "Veauchette",
      "Veauche",
      "Unieux",
      "La Fouillouse",
      "Saint-Romain-le-Puy",
      "Roche-la-Molière",
      "Firminy",
      "Villars",
      "Saint-Priest-en-Jarez",
      "L'Étrat",
      "La Tour-en-Jarez",
      "Saint-Héand",
      "Saint-Bonnet-les-Oules",
      "Saint-Galmier",
      "Chambœuf",
    ],
  },
];

export const findZone = (slug: string) => zones.find((z) => z.slug === slug);
