import type { Metadata } from "next";
import { PrivacyPolicy } from "@/components/concept-v2/legal/PrivacyPolicy";

export const metadata: Metadata = {
  title: "Privacy Policy — Malaky",
  description:
    "How Malaky handles personal information collected through its public website, including demo requests.",
};

export default function Privacy() {
  return <PrivacyPolicy />;
}
