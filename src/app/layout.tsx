import type { Metadata } from "next";
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${rubik.variable} ${nunitoSans.variable}`}>
      <body className="antialiased font-sans">
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}
