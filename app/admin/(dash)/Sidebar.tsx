"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import PublishButton from "./PublishButton";

const LIENS = [
  { href: "/admin", label: "Tableau de bord", exact: true },
  { href: "/admin/reglages", label: "Réglages généraux" },
  { href: "/admin/pages", label: "Pages du site" },
  { href: "/admin/communes", label: "Fiches communes" },
  { href: "/admin/zones", label: "Zones de vente" },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/leads", label: "Demandes reçues" },
  { href: "/admin/compte", label: "Mon mot de passe" },
];

export default function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout/", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <aside className="md:w-64 shrink-0 bg-slate-900 text-slate-100 md:min-h-screen flex flex-col">
      <div className="p-5 border-b border-white/10">
        <div className="font-semibold">Romain Rieg</div>
        <div className="text-xs text-slate-400 mt-0.5">Administration du site</div>
      </div>

      <nav className="p-3 flex flex-col gap-0.5 flex-1">
        {LIENS.map((l) => {
          const actif = l.exact ? pathname === l.href : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-2 rounded-lg text-sm transition ${actif ? "bg-white/15 text-white font-medium" : "text-slate-300 hover:bg-white/10"}`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-3">
        <PublishButton />
        <div className="text-xs text-slate-400 px-1 truncate">{email}</div>
        <button onClick={logout} className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/10">
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}
