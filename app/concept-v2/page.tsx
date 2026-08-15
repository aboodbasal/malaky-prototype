import { Hero } from "@/components/concept-v2/hero/Hero";
import { Prompts } from "@/components/concept-v2/sections/Prompts";
import { OneEvent } from "@/components/concept-v2/sections/OneEvent";
import { Approval } from "@/components/concept-v2/sections/Approval";
import { Memory } from "@/components/concept-v2/sections/Memory";
import { Arabic } from "@/components/concept-v2/sections/Arabic";
import { Trust } from "@/components/concept-v2/sections/Trust";
import { BrandDemo } from "@/components/concept-v2/branddemo/BrandDemo";
import { ClosingCta } from "@/components/concept-v2/sections/ClosingCta";

export default function ConceptHome() {
  return (
    <>
      <Hero />
      <Prompts />
      <OneEvent />
      <Approval />
      <Memory />
      <Arabic />
      <Trust />
      <BrandDemo />
      <ClosingCta
        id="request-demo"
        href="#request-demo"
        title="Let's build Malaky around your business"
        lead="We'll learn how your company operates, show you what Malaky would prepare, and recommend the right deployment for your team."
        cta="Request a private demo"
      />
    </>
  );
}
