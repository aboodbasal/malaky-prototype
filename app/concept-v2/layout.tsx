import type { Metadata } from "next";
import { HOME_DESCRIPTION, HOME_TITLE, pageMetadata } from "@/lib/site";
import { Footer } from "@/components/concept-v2/Footer";
import { Header } from "@/components/concept-v2/Header";
import { MediaDefs } from "@/components/concept-v2/BrandMedia";

/* The homepage's own wording, and the default for any page in this segment
   that does not set its own. Both strings live in lib/site.ts so the head,
   Open Graph and the X card cannot drift apart. */
export const metadata: Metadata = pageMetadata({
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
});

export default function ConceptLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {/* Gradient definitions for every generated creative, rendered once. */}
      <MediaDefs />
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
