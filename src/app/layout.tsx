import type { Metadata } from "next";
import { Source_Sans_3, JetBrains_Mono, Tienne } from "next/font/google";
import { headers } from "next/headers";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "sonner";
import "./globals.css";
import { PHProvider } from "./providers";

// EU + EEA + UK (similar cookie laws)
const GDPR_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE", "IS", "LI", "NO", "GB", "CH", // CH = Switzerland (similar laws)
]);

const sourceSans = Source_Sans_3({
  display: "swap",
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  display: "swap",
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const tienne = Tienne({
  display: "swap",
  variable: "--font-tienne",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

export const metadata: Metadata = {
  title: "Boost - Your 30-Day Marketing Plan",
  description:
    "Stuck on marketing? Get a custom 30-day plan with real competitor research. We find what's working in your market and show you exactly what to do.",
  metadataBase: new URL("https://actionboo.st"),
  openGraph: {
    title: "Boost - Your 30-Day Marketing Plan",
    description:
      "Stuck on marketing? Get a custom 30-day plan with real competitor research. We find what's working in your market and show you exactly what to do.",
    url: "https://actionboo.st",
    siteName: "Boost",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Boost - Your 30-Day Marketing Plan",
    description:
      "Stuck on marketing? Get a custom 30-day plan with real competitor research. We find what's working in your market and show you exactly what to do.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const country = headersList.get("x-vercel-ip-country") || "";
  const isGdprCountry = GDPR_COUNTRIES.has(country);

  return (
    <html lang="en">
      <body
        className={`${sourceSans.variable} ${jetbrainsMono.variable} ${tienne.variable} font-sans antialiased`}
      >
        <PHProvider cookieless={isGdprCountry}>{children}</PHProvider>
        <Toaster position="bottom-center" />
        <Analytics />
      </body>
    </html>
  );
}
