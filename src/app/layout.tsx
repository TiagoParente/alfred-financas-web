import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Alfred Finanças",
    template: "%s | Alfred Finanças",
  },
  description:
    "Plataforma de inteligência financeira pessoal e familiar. Organize, controle e planeje suas finanças com clareza.",
  keywords: ["finanças", "gestão financeira", "controle financeiro", "família"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} dark`} suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
