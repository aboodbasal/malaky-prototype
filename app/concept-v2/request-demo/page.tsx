import type { Metadata } from "next";
import { RequestDemo } from "@/components/concept-v2/requestdemo/RequestDemo";

export const metadata: Metadata = {
  title: "Request a private demo — Malaky",
  description:
    "Tell us about your company and we'll make the conversation specific to your brand, markets and marketing operation.",
};

export default function RequestDemoPage() {
  return <RequestDemo />;
}
