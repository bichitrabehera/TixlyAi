import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import {
  Fraunces,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
} from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { RouteThemeGuard } from "@/components/RouteThemeGuard";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import ErrorBoundary from "@/components/ErrorBoundary";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: "Tixly - Screenshot to Bug Ticket",
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
        <body
          className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} ${fraunces.variable} min-h-full bg-(--bg) font-sans antialiased`}
        >
          <TooltipProvider>
            <ErrorBoundary>
              <RouteThemeGuard />
              {children}
            </ErrorBoundary>
          </TooltipProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
