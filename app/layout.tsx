import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
export const dynamic = 'force-dynamic'
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
});

export const metadata: Metadata = {
  title: "GameHub",
  description: "Game discovery platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${space.variable} antialiased`}>
        <Header />
        {children}
      </body>
    </html>
  );
}
