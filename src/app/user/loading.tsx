"use client";

import { Spinner } from "@/components/ui";
import { useTranslation } from "@/hooks/use-translation";

export default function DashboardLoading() {
  const { t } = useTranslation();
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Spinner />
        <p className="text-[#004953]/50 text-sm">{t("loading.text")}</p>
      </div>
    </div>
  );
}
