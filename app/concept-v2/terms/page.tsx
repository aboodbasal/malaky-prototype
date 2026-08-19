import type { Metadata } from "next";
import { TermsOfUse } from "@/components/concept-v2/legal/TermsOfUse";

export const metadata: Metadata = {
  title: "Website Terms of Use — Malaky",
  description:
    "The terms that apply to using the Malaky website, its previews and its demo request form.",
};

export default function Terms() {
  return <TermsOfUse />;
}
