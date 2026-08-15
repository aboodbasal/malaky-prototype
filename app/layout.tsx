import type { Metadata } from "next";
import { Inter, Instrument_Serif, IBM_Plex_Sans_Arabic } from "next/font/google";
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
    <html lang="en" className={`${sans.variable} ${serif.variable} ${arabic.variable}`}>
      <body>{children}</body>
    </html>
  );
}
