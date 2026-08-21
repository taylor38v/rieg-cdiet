/* Porte d'entrée du back-office : vérification de session ICI (serveur, runtime Node),
 * volontairement pas dans un middleware (edge = variables figées → signature divergente). */
import { redirect } from "next/navigation";
import { sessionActuelle } from "@/lib/auth.mjs";
import Sidebar from "./Sidebar";

export const dynamic = "force-dynamic";

export const metadata = { robots: { index: false, follow: false } };

export default async function DashLayout({ children }: { children: React.ReactNode }) {
  const session = await sessionActuelle();
  if (!session) redirect("/admin/login/");

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 md:flex">
      <Sidebar email={session.email} />
      <main className="flex-1 min-w-0 p-5 md:p-8 max-w-4xl mx-auto w-full">{children}</main>
    </div>
  );
}
