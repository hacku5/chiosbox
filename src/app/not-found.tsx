"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F9F7] px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-[#004953] mb-2">{t("notFound.title")}</h2>
        <p className="text-[#004953]/60 mb-6">
          {t("notFound.description")}
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-[#5D3FD3] text-white rounded-xl font-semibold hover:bg-[#5D3FD3]/90 transition-colors inline-block"
        >
          {t("notFound.homeLink")}
        </Link>
      </div>
    </div>
  );
}
