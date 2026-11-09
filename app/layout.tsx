import "./globals.css";
import type { Metadata } from "next";
const url = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export const metadata: Metadata = {
  metadataBase: new URL(url),
  title: "ALIENTECH · Tecnología sin límites en Rosario",
  description: "Smartphones, gaming, audio y accesorios con envío gratis en Rosario. Precios competitivos y atención personalizada.",
  openGraph: { title: "ALIENTECH", description: "Tecnología sin límites. Envío gratis en Rosario.", images: ["/alien.png"], locale: "es_AR", type: "website" },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="es"><body>{children}</body></html>;
}
