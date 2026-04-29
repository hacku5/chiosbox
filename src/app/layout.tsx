import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Rubik, Nunito_Sans } from "next/font/google";
import { ClientLayoutWrapper } from "@/components/client-layout-wrapper";
import "./globals.css";

const rubik = Rubik({
  subsets: ["latin", "latin-ext"],
  variable: "--font-rubik",
  weight: ["300", "400", "500", "600", "700"],
});

const nunitoSans = Nunito_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-nunito",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ChiosBox - Avrupa Teslimat Adresiniz Hazır",
  description:
    "Türkiye'den AB'ye e-ticaret alışverişi yapanlar için Sakız Adası merkezli paket konsolidasyon yönetimi.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ChiosBox",
  },
  other: {
    "theme-color": "#5D3FD3",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "en";

  return (
    <html lang={lang} data-scroll-behavior="smooth" className={`${rubik.variable} ${nunitoSans.variable}`}>
      <body className="antialiased font-sans">
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}
