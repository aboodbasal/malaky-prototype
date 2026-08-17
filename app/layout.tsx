import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, DM_Sans } from "next/font/google";
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
    <html lang="en" className={`${sans.variable} ${arabic.variable}`}>
      <body>{children}</body>
    </html>
  );
}
