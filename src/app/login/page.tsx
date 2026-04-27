"use client";

import { Suspense } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";
import { useTranslation } from "@/hooks/use-translation";

export default function LoginPage() {
  const { t } = useTranslation();
  return (
    <AuthLayout
      title={t("login.pageTitle")}
      subtitle={t("login.pageSubtitle")}
    >
      <Suspense fallback={<div className="h-80 animate-pulse bg-deep-sea-teal/5 rounded-2xl" />}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
