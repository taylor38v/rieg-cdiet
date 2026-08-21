import type { NextConfig } from "next";
import path from "node:path";

// Plus de `output: "export"` : le site tourne désormais comme une app Next (lecture
// des contenus depuis Netlify Blobs à l'exécution, publication instantanée via
// revalidatePath). C'est ce qui permet le CMS intégré, sans Git ni Netlify Identity.
const nextConfig: NextConfig = {
  images: { unoptimized: true },
  trailingSlash: true,
  // Un package-lock.json dans le dossier PARENT fait deviner à Next un mauvais
  // « workspace root » → le tracing des fichiers des fonctions serverless se fait au
  // mauvais endroit et TOUTES les routes tombent en 404 sur Netlify. On force la racine
  // sur le dossier du projet.
  outputFileTracingRoot: path.resolve(),
  // Inclut les fichiers de contenu initial (seed) dans le bundle serverless : au 1er
  // démarrage sur Netlify les Blobs sont vides → db.mjs lit lib/seed via fs. Sans ça,
  // ces fichiers (lus dynamiquement) ne seraient pas tracés par Next.
  outputFileTracingIncludes: {
    "/**": ["./lib/seed/**"],
  },
};

export default nextConfig;
