import type { Metadata } from "next";
import { Montserrat, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import SiteChrome from "./components/SiteChrome";
import { getSiteData } from "./lib/content";
import { ClientDataProvider } from "./lib/ClientData";

const sans = Montserrat({ variable: "--font-sans", subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });
const serif = Cormorant_Garamond({ variable: "--font-serif", subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://romainrieg-immobilier.fr"),
  title: {
    default: "Romain Rieg - Conseiller immobilier Lyon Ouest & Mont d'Or",
    template: "%s | Romain Rieg Immobilier",
  },
  description: "Estimation, vente, acquisition et gestion locative sur le Mont d'Or, l'Ouest lyonnais et la Plaine du Forez. Accompagnement sur-mesure par Romain Rieg, conseiller iad.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    // "./" = URL de la page courante (composée avec metadataBase).
    // Une URL absolue ici serait héritée telle quelle par TOUTES les pages.
    url: "./",
    siteName: "Romain Rieg Immobilier",
    title: "Romain Rieg - Conseiller immobilier Lyon Ouest & Mont d'Or",
    description: "Estimation, vente, acquisition et gestion locative sur le Mont d'Or et l'Ouest lyonnais.",
    images: [{ url: "/photos/Ville-de-saint-didier-au-mont-d-or_1920.jpg", width: 1920, height: 1280 }],
  },
  twitter: { card: "summary_large_image" },
  // ⚠️ Canonical auto-référente : "./" se résout sur l'URL de chaque page.
  // Avant, une URL absolue était héritée par les 42 pages -> toutes déclaraient
  // l'accueil comme canonical (Google les aurait traitées comme des doublons).
  alternates: { canonical: "./" },
  robots: { index: true, follow: true },
  // Vérification de propriété Google Search Console (méthode balise HTML).
  // Ne pas retirer : Google revérifie périodiquement, sa suppression fait perdre l'accès.
  verification: { google: "OtrZLNck105HqOgMuwQ_dFrVO6g2mkR6gosEvbSU5XE" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const data = await getSiteData();
  return (
    <html lang="fr" className={`${sans.variable} ${serif.variable} antialiased`}>
      <body className="min-h-screen flex flex-col bg-ivory text-ink">
        <ClientDataProvider value={data}>
          <SiteChrome justifie={data.settings.justifier_textes !== false}>{children}</SiteChrome>
        </ClientDataProvider>
      </body>
    </html>
  );
}
