import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ملاكي",
  description: "مساعد ذكي للأعمال العربية",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
