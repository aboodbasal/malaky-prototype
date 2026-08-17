import { Suspense } from "react";
import type { Metadata } from "next";
import { Checkout } from "@/components/concept-v2/purchase/Checkout";

export const metadata: Metadata = {
  title: "Checkout — Malaky",
  description: "Your details, and the start of your Malaky deployment.",
};

export default function CheckoutPage() {
  return (
    <Suspense>
      <Checkout />
    </Suspense>
  );
}
