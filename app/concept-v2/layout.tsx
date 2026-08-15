import type { Metadata } from "next";
import { Footer } from "@/components/concept-v2/Footer";
import { Header } from "@/components/concept-v2/Header";
import { MediaDefs } from "@/components/concept-v2/BrandMedia";

export const metadata: Metadata = {
  title: "Malaky — your marketing was working before you were",
  description:
    "Malaky learns your business, watches what's coming, and prepares your marketing across every channel before you ask.",
};

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
