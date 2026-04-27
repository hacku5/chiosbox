"use client";

import { Suspense } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { RegisterForm } from "@/components/auth/register-form";

import { useTranslation } from "@/hooks/use-translation";

export default function RegisterPage() {
  const { t } = useTranslation();
  return (
    <AuthLayout
      title={t("register.pageTitle")}
      subtitle={t("register.pageSubtitle")}
    >
      <Suspense fallback={<div className="h-96 animate-pulse bg-deep-sea-teal/5 rounded-2xl" />}>
        <RegisterForm />
      </Suspense>
    </AuthLayout>
  );
}
