import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DocScan AI — анализ договоров",
  description: "AI-анализ договоров: тип, стороны, суммы, сроки, риски",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
