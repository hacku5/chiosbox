"use client";

import { Button } from "@/components/ui";
import { useTranslation } from "@/hooks/use-translation";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-[#004953] mb-2">{t("error.admin.title")}</h2>
        <p className="text-[#004953]/60 mb-6 text-sm">
          {t("error.admin.description")}
        </p>
        <Button onClick={reset}>{t("error.admin.retry")}</Button>
      </div>
    </div>
  );
}
