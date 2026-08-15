import type { Metadata } from "next";
import { PricingPage } from "@/components/concept-v2/pricing/PricingPage";
import { ClosingCta } from "@/components/concept-v2/sections/ClosingCta";

export const metadata: Metadata = {
  title: "Pricing — Malaky",
  description:
    "Malaky is not another tool. It's your marketing operation. Business, Scale and Enterprise deployments, each beginning with intelligence setup.",
};

export default function Pricing() {
  return (
    <>
      <PricingPage />
      <ClosingCta
        id="request-demo"
        title="Let's build Malaky around your business"
        lead="We'll learn how your company operates, show you what Malaky would prepare, and recommend the right deployment for your team."
        cta="Request a private demo"
        href="#request-demo"
      />
    </>
  );
}
