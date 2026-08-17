import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, DM_Sans } from "next/font/google";
import { HOME_DESCRIPTION, HOME_TITLE, SITE_URL, pageMetadata } from "@/lib/site";
import "./globals.css";

/**
 * The Latin face for the whole site — display and text alike.
 *
 * DM Sans is OFL-licensed and free for commercial use, served through
 * next/font/google. One family carries the entire English hierarchy: size,
 * weight, spacing and opacity do the separating, not a second typeface.
 *
 * Requested as the whole variable font. The weight range is what the
 * hierarchy is built from, and the optical-size axis is what stops the same
 * face from looking like enlarged small type at 66px or like shrunk display
 * type at 11px.
 */
const sans = DM_Sans({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-sans",
});

const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-arabic",
});

/**
 * The site-wide defaults.
 *
 * `metadataBase` is what turns the relative image path into the absolute URL
 * a social crawler needs. It reads the configured hostname and falls back to
 * localhost, so this builds with or without the production value — see
 * lib/site.ts.
 *
 * The title and description here are the homepage's, and every child page
 * that sets its own overrides them.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...pageMetadata({ title: HOME_TITLE, description: HOME_DESCRIPTION }),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${arabic.variable}`}>
      <body>{children}</body>
    </html>
  );
}
