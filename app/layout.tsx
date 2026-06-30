import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { RouteThemeGuard } from "@/components/RouteThemeGuard";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import ErrorBoundary from "@/components/ErrorBoundary";

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
    <ClerkProvider signInUrl="/login">
      <html lang="en" suppressHydrationWarning>
        <Analytics />
        <SpeedInsights />
        <body className={`${inter.className} min-h-full bg-(--bg) antialiased`}>
          <ErrorBoundary>
            <RouteThemeGuard />
            {children}
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}
