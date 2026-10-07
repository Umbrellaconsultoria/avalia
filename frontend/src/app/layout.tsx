import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LocalAuthProvider } from "@/providers/LocalAuthProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cursos e Eventos | PI",
  description: "Plataforma de Avaliação de Cursos e Eventos do Governo do Piauí",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <LocalAuthProvider>
          {children}
        </LocalAuthProvider>
      </body>
    </html>
  );
}
