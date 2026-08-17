import { Suspense } from "react";
import type { Metadata } from "next";
import { Onboarding } from "@/components/concept-v2/purchase/Onboarding";

export const metadata: Metadata = {
  title: "Intelligence Setup — Malaky",
  description:
    "Teach Malaky your business, brand, voices, markets, channels, calendar and approvals.",
};

export default function OnboardingPage() {
  return (
    <Suspense>
      <Onboarding />
    </Suspense>
  );
}
