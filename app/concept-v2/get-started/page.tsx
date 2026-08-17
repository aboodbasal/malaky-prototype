import { Suspense } from "react";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import { GetStarted } from "@/components/concept-v2/purchase/GetStarted";

/* Title and description unchanged — wrapped so this page shares the site
   card instead of dropping it. */
export const metadata: Metadata = pageMetadata({
  title: "Get started — Malaky",
  description:
    "Choose the Malaky deployment that fits your business, add the optional operating layer, and start Intelligence Setup.",
});

/* The selection lives in the query string, so the client component reads it
   with useSearchParams and the page keeps its static prerender. */
export default function GetStartedPage() {
  return (
    <Suspense>
      <GetStarted />
    </Suspense>
  );
}
