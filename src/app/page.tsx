import ClosingSection from "@/features/landing/components/ClosingSection";
import EvidenceSection from "@/features/landing/components/EvidenceSection";
import HeroSection from "@/features/landing/components/HeroSection";
import HowItWorksSection from "@/features/landing/components/HowItWorksSection";
import LandingNav from "@/features/landing/components/LandingNav";
import LimitsSection from "@/features/landing/components/LimitsSection";
import ProofSection from "@/features/landing/components/ProofSection";
import ReadingSection from "@/features/landing/components/ReadingSection";
import SourceSection from "@/features/landing/components/SourceSection";

/**
 * Overview page: claim, evidence, one scored day, method, caveats, source.
 *
 * Every section is a Server Component and every figure lives in
 * features/landing/content.ts, measured from the shipped model bundle -- so
 * this route ships almost no JavaScript beyond the two scroll animations.
 */
export default function Home() {
  return (
    <div className="bg-[var(--viz-plane)]">
      <LandingNav />
      <HeroSection />
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
