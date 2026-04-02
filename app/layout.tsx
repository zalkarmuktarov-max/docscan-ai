import type { Metadata } from "next";
import "./globals.css";
import NeuralBackground from "@/components/NeuralBackground";

export const metadata: Metadata = {
  title: "CognitAI DocScan — анализ договоров",
  description: "AI-анализ договоров: тип, стороны, суммы, сроки, риски",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="h-full" style={{ backgroundColor: '#0a0e1a' }}>
      <body className="min-h-full flex flex-col antialiased" style={{ backgroundColor: '#0a0e1a' }}>
        <NeuralBackground />
        {children}
      </body>
    </html>
  );
}
