import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TixlyAi - Screenshot to Bug Ticket",
  description: "Convert screenshots to structured bug tickets using OCR and AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Analytics />
      <body
        className={`${inter.className} min-h-full bg-neutral-50 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
