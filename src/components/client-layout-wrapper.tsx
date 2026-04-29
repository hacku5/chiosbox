"use client";

import { usePathname } from "next/navigation";
import { TranslationProvider } from "@/lib/i18n";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAppRoute = pathname.startsWith("/user") || pathname.startsWith("/admin");

  return (
    <TranslationProvider>
      {isAppRoute ? (
        <>{children}</>
      ) : (
        <>
          <Navbar />
          {children}
          <Footer />
        </>
      )}
    </TranslationProvider>
  );
}
