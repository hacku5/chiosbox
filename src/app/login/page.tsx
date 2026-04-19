import { Suspense } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Tekrar Hoş Geldiniz"
      subtitle="ChiosBox hesabınıza giriş yapın"
    >
      <Suspense fallback={<div className="h-80 animate-pulse bg-deep-sea-teal/5 rounded-2xl" />}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
