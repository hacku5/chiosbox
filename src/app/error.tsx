"use client";

import { Button } from "@/components/ui";
import { useTranslation } from "@/hooks/use-translation";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F9F7] px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-[#004953] mb-2">{t("error.root.title")}</h2>
        <p className="text-[#004953]/60 mb-6">
          {t("error.root.description")}
        </p>
        <Button size="lg" onClick={reset}>
          {t("error.root.retry")}
        </Button>
      </div>
    </div>
  );
}
