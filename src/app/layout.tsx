import type { Metadata } from "next";
import { Manrope, JetBrains_Mono, Tienne } from "next/font/google";
import "./globals.css";
import { PHProvider } from "./providers";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${jetbrainsMono.variable} ${tienne.variable} font-sans antialiased`}
      >
        <PHProvider>{children}</PHProvider>
      </body>
    </html>
  );
}
