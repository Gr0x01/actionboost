import type { Metadata } from "next";
import { Manrope, JetBrains_Mono, Tienne } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { PHProvider } from "./providers";

// EU + EEA + UK (similar cookie laws)
const GDPR_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE", "IS", "LI", "NO", "GB", "CH", // CH = Switzerland (similar laws)
]);

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const tienne = Tienne({
  variable: "--font-tienne",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

export const metadata: Metadata = {
  title: "Actionboo.st - AI Growth Strategy for Founders",
  description:
    "Stuck on growth? Get AI-powered strategy with real competitive research. Not ChatGPT fluff.",
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
        className={`${manrope.variable} ${jetbrainsMono.variable} ${tienne.variable} font-sans antialiased`}
      >
        <PHProvider cookieless={isGdprCountry}>{children}</PHProvider>
      </body>
    </html>
  );
}
