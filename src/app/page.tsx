import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { PackageRequest } from "@/components/package-request";
import { PricingCalculator } from "@/components/pricing-calculator";
import { Trust } from "@/components/trust";
import { FinalCTA } from "@/components/final-cta";

export default function Home() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <PackageRequest />
      <PricingCalculator />
      <Trust />
      <FinalCTA />
    </main>
  );
}
