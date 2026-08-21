import Link from "next/link";

const CARTES = [
  { href: "/admin/reglages", titre: "Réglages généraux", desc: "Coordonnées, réseaux, menu, pied de page, libellés des boutons." },
  { href: "/admin/pages", titre: "Pages du site", desc: "Textes de l'accueil, Vendre, Acheter, Avis de valeur, Contact…" },
  { href: "/admin/communes", titre: "Fiches communes", desc: "Prix, quartiers, écoles, photos et vidéos de chaque commune." },
  { href: "/admin/zones", titre: "Zones de vente", desc: "Contenu des pages Ouest lyonnais, Plaine du Forez, Saint-Didier." },
  { href: "/admin/articles", titre: "Articles", desc: "Publier et modifier les articles du blog." },
  { href: "/admin/leads", titre: "Demandes reçues", desc: "Les messages envoyés via les formulaires du site." },
];

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800">Bienvenue 👋</h1>
      <p className="text-slate-500 mt-2 max-w-2xl">
        Modifiez le contenu de votre site depuis les rubriques ci-dessous. Après vos modifications,
        cliquez sur <strong>« Mettre le site à jour »</strong> (en bas à gauche) pour les publier en ligne.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mt-8">
        {CARTES.map((c) => (
          <Link key={c.href} href={c.href} className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-400 hover:shadow-sm transition">
            <div className="font-medium text-slate-800">{c.titre}</div>
            <div className="text-sm text-slate-500 mt-1">{c.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
