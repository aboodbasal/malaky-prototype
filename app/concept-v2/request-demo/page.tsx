import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import { RequestDemo } from "@/components/concept-v2/requestdemo/RequestDemo";

/* Title and description unchanged — wrapped so this page shares the site
   card instead of dropping it. */
export const metadata: Metadata = pageMetadata({
  title: "Request a private demo — Malaky",
  description:
    "Tell us about your company and we'll make the conversation specific to your brand, markets and marketing operation.",
});

export default function RequestDemoPage() {
  return <RequestDemo />;
}
