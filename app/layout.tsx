import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
export const metadata: Metadata = {
  title: "Tutor Gaya — Preparação TCDF",
  description: "Controle de questões e feedback de discursivas para a preparação ao TCDF.",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={geistSans.variable + " antialiased"}>{children}</body>
    </html>
  );
}
