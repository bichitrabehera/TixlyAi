import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { RouteThemeGuard } from "@/components/RouteThemeGuard";
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
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <Analytics />
        <body
          className={`${inter.className} min-h-full bg-[var(--bg)] antialiased`}
        >
          <RouteThemeGuard />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
