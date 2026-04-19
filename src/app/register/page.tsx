import { Suspense } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <AuthLayout
      title="ChiosBox'a Katılın"
      subtitle="Avrupa teslimat adresinizi hemen alın, kapıdan kapıya kargo ayrıcalığını yaşayın"
    >
      <Suspense fallback={<div className="h-96 animate-pulse bg-deep-sea-teal/5 rounded-2xl" />}>
        <RegisterForm />
      </Suspense>
    </AuthLayout>
  );
}
