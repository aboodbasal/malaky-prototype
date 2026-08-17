import { Suspense } from "react";
import type { Metadata } from "next";
import { Complete } from "@/components/concept-v2/purchase/Complete";

export const metadata: Metadata = {
  title: "Your setup is underway — Malaky",
  description: "What Malaky has been given, and what happens next.",
};

export default function CompletePage() {
  return (
    <Suspense>
      <Complete />
    </Suspense>
  );
}
