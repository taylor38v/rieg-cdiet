import fs from "node:fs";

const path = "public/admin/config.yml";
let c = fs.readFileSync(path, "utf8");

const hints = [
  // Surtitre - apparaît partout, presque toujours pareil
  [
    /\{\s*name:\s*"surtitre",\s*label:\s*"Surtitre",\s*widget:\s*"string"\s*\}/g,
    `{ name: "surtitre", label: "Surtitre", widget: "string", hint: "Petit texte en or affiché au-dessus du titre H2." }`,
  ],
  // Intro générique
  [
    /\{\s*name:\s*"intro",\s*label:\s*"Intro",\s*widget:\s*"text"\s*\}/g,
    `{ name: "intro", label: "Intro", widget: "text", hint: "Court paragraphe d'introduction sous le titre." }`,
  ],
  // CTA href
  [
    /\{\s*name:\s*"cta_primary_href",\s*label:\s*"Bouton principal - lien",\s*widget:\s*"string"\s*\}/g,
    `{ name: "cta_primary_href", label: "Bouton principal - lien", widget: "string", hint: "Page interne (ex: /contact) ou URL externe (https://...)." }`,
  ],
  [
    /\{\s*name:\s*"cta_secondary_href",\s*label:\s*"Bouton secondaire - lien",\s*widget:\s*"string"\s*\}/g,
    `{ name: "cta_secondary_href", label: "Bouton secondaire - lien", widget: "string", hint: "Page interne (ex: /rejoindre) ou URL externe." }`,
  ],
  // SEO
  [
    /\{\s*name:\s*"meta_title",\s*label:\s*"Titre SEO",\s*widget:\s*"string"\s*\}/g,
    `{ name: "meta_title", label: "Titre SEO", widget: "string", hint: "Titre affiché dans l'onglet du navigateur et dans les résultats Google. 50-60 caractères max." }`,
  ],
  [
    /\{\s*name:\s*"meta_description",\s*label:\s*"Description SEO",\s*widget:\s*"text"\s*\}/g,
    `{ name: "meta_description", label: "Description SEO", widget: "text", hint: "Texte sous le titre dans les résultats Google. 150-160 caractères." }`,
  ],
];

let total = 0;
for (const [re, rep] of hints) {
  const matches = c.match(re);
  if (matches) total += matches.length;
  c = c.replace(re, rep);
}

fs.writeFileSync(path, c);
console.log(`✓ ${total} hints ajoutés dans public/admin/config.yml`);
