import { auth } from "@/lib/auth";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { UseCasesSection } from "@/components/landing/use-cases-section";
import { SocialProofSection } from "@/components/landing/social-proof-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FaqSection } from "@/components/landing/faq-section";
import { CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

export default async function Home() {
  const { user } = await auth();
  const isLoggedIn = user?.isLoggedIn;

  return (
    <main className="min-h-screen">
      <HeroSection isLoggedIn={isLoggedIn} />
      <FeaturesSection />
      <HowItWorksSection />
      <UseCasesSection />
      <SocialProofSection />
      <PricingSection />
      <FaqSection />
      <CtaSection isLoggedIn={isLoggedIn} />
      <Footer />
    </main>
  );
}
