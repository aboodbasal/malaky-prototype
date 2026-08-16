import { Hero } from "@/components/concept-v2/hero/Hero";
import { Prompts } from "@/components/concept-v2/sections/Prompts";
import { OneEvent } from "@/components/concept-v2/sections/OneEvent";
import { RealBrands } from "@/components/concept-v2/sections/RealBrands";
import { Approval } from "@/components/concept-v2/sections/Approval";
import { Memory } from "@/components/concept-v2/sections/Memory";
import { Arabic } from "@/components/concept-v2/sections/Arabic";
import { BrandDemo } from "@/components/concept-v2/branddemo/BrandDemo";
import { ClosingCta } from "@/components/concept-v2/sections/ClosingCta";

/**
 * Claim → demonstration → proof, then the control story, then the visitor's
 * own company.
 *
 * Real-brand proof used to sit at 72% scroll depth, after the argument was
 * over. It now follows the fan-out it is evidence for. The standalone trust
 * section is gone — its four guarantees live inside the approval section that
 * demonstrates them.
 */
export default function ConceptHome() {
  return (
    <>
      <Hero />
      <Prompts />
      <OneEvent />
      <RealBrands />
      <Approval />
      <Memory />
      <Arabic />
      <BrandDemo />
      <ClosingCta
        id="request-demo"
        href="/concept-v2/request-demo"
        title="Let's build Malaky around your business"
        lead="See how Malaky would be configured around your business, brand and marketing operation."
        cta="Request a private demo"
        secondary={{ label: "View pricing", href: "/concept-v2/pricing" }}
      />
    </>
  );
}
