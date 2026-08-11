import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "DevReady — preparação técnica para entrevistas",
    template: "%s | DevReady",
  },
  description: "Analise vagas, identifique lacunas e pratique entrevistas com feedback e plano de evolução.",
  applicationName: "DevReady",
  keywords: ["entrevista técnica", "carreira júnior", "treino por vaga", "tecnologia", "empregabilidade"],
  authors: [{ name: "Equipe DevReady" }],
  creator: "Equipe DevReady",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "DevReady",
    title: "DevReady — preparação técnica para entrevistas",
    description: "Transforme os requisitos de uma vaga em diagnóstico, treino e plano de evolução.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#151632",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${fraunces.variable} ${manrope.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
