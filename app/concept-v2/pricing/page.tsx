import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import { PricingPage } from "@/components/concept-v2/pricing/PricingPage";
import { ClosingCta } from "@/components/concept-v2/sections/ClosingCta";

/* Title and description unchanged — wrapped so this page shares the site
   card instead of dropping it. */
export const metadata: Metadata = pageMetadata({
  title: "Pricing — Malaky",
  description:
    "Malaky is not another tool. It's your marketing operation. Business, Scale and Enterprise deployments, each beginning with intelligence setup.",
});

export default function Pricing() {
  return (
    <>
      <PricingPage />
      {/* Deliberately not the homepage's closing words — a visitor who reads
          both should not hit the same wall twice. */}
      <ClosingCta
        id="request-demo"
        title="Let's design your Malaky deployment"
        lead="We'll look at your brands, markets, team and approval process and recommend the right operating scope."
        cta="Request a private demo"
        href="/concept-v2/request-demo"
        secondary={{ label: "Back to Malaky", href: "/concept-v2" }}
      />
    </>
  );
}
