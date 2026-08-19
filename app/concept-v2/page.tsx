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
      {/* The homepage closes on the route most visitors take. Business and
          Scale are self-serve, so the last thing on the page is the start of
          that journey rather than a request for a conversation — the demo path
          is still one click away in the header, and it is where the Enterprise
          card on the pricing page sends anyone whose deployment is scoped. A
          third button here would only make the visitor choose between two
          doors before they have chosen anything else. */}
      <ClosingCta
        id="get-started"
        href="/concept-v2/get-started"
        title="Let's build Malaky around your business"
        lead="Choose your deployment and start setting Malaky up around your business, brand and marketing operation."
        cta="Get started"
        secondary={{ label: "View pricing", href: "/concept-v2/pricing" }}
      />
    </>
  );
}
