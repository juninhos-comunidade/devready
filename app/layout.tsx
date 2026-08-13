import type { Metadata, Viewport } from "next";
import { Sora, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800"],
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-code",
  weight: ["400", "500"],
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
      <body className={`${sora.variable} ${hankenGrotesk.variable} ${jetbrainsMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
