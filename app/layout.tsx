import type { Metadata } from "next";
import {
  Inter,
  Instrument_Serif,
  IBM_Plex_Sans_Arabic,
  Newsreader,
} from "next/font/google";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-serif",
});

/**
 * Under test for the hero headline only — see components/concept-v2/hero.
 *
 * Newsreader is OFL-licensed and free for commercial use, served here through
 * next/font/google like every other face on the site. Instrument Serif stays
 * loaded and still sets every other serif on the page, so the two can be
 * compared without touching anything else.
 *
 * The variable font is requested whole rather than pinned to one instance:
 * the weight range costs nothing extra to serve, and the optical-size axis is
 * what keeps the face from looking like small text blown up at display sizes.
 */
const displayTest = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-display-test",
});

const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-arabic",
});

export const metadata: Metadata = {
  title: "Malaky",
  description: "A proactive marketing operating system.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable} ${displayTest.variable} ${arabic.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
