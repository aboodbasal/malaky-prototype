import { Suspense } from "react";
import type { Metadata } from "next";
import { Schedule } from "@/components/concept-v2/purchase/Schedule";

export const metadata: Metadata = {
  title: "Your walkthrough — Malaky",
  description: "Tell us when the walkthrough with the team running your setup should happen.",
};

export default function SchedulePage() {
  return (
    <Suspense>
      <Schedule />
    </Suspense>
  );
}
