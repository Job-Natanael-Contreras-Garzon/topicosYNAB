import type { Metadata } from "next";
import { Inter, Nunito } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });

export const metadata: Metadata = {
  title: "Sobres — presupuesto base cero",
  description: "Dale un trabajo a cada boliviano que entra. Presupuesto personal base cero.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${nunito.variable}`}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
