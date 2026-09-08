import ClosingSection from "@/features/landing/components/ClosingSection";
import EvidenceSection from "@/features/landing/components/EvidenceSection";
import HeroSection from "@/features/landing/components/HeroSection";
import HowItWorksSection from "@/features/landing/components/HowItWorksSection";
import LandingNav from "@/features/landing/components/LandingNav";
import LimitsSection from "@/features/landing/components/LimitsSection";
import ProofSection from "@/features/landing/components/ProofSection";
import ReadingSection from "@/features/landing/components/ReadingSection";
import SourceSection from "@/features/landing/components/SourceSection";
import TwoPagesSection from "@/features/landing/components/TwoPagesSection";

/**
 * Overview page: claim, the two pages, evidence, one scored day, method,
 * caveats, source.
 *
 * TwoPagesSection sits second, immediately under the claim, because the split
 * between the two models is the thing a reader has to hold before any figure
 * on this page means anything -- an error quoted for 2025 is only evidence if
 * you know the model that produced it never read 2025.
 *
 * Every section is a Server Component and every figure lives in
 * features/landing/content.ts or features/forecast/lib/products.ts, measured
 * from the shipped model bundles -- so this route ships almost no JavaScript
 * beyond the two scroll animations.
 */
export default function Home() {
  return (
    <div className="bg-[var(--viz-plane)]">
      <LandingNav />
      <HeroSection />
      <TwoPagesSection />
      <EvidenceSection />
      <ProofSection />
      <HowItWorksSection />
      <ReadingSection />
      <LimitsSection />
      <SourceSection />
      <ClosingSection />
    </div>
  );
}
