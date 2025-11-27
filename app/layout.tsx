import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PageTransition from "./components/PageTransition";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "KUJIRA studio.",
  description: "深海のように静かで、確かな創造を。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" style={{ backgroundColor: '#001A33' }}>
      <body className={`${inter.variable} font-sans text-white antialiased`} style={{ backgroundColor: '#001A33' }}>
        <PageTransition>
          {children}
        </PageTransition>
      </body>
    </html>
  );
}
