import { Header, Footer } from "@/components/layout";
import {
  Hero,
  Frameworks,
  WhatYouGet,
  HowItWorks,
  Pricing,
} from "@/components/landing";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <Hero />
        <Frameworks />
        <WhatYouGet />
        <HowItWorks />
        <Pricing />
      </main>

      <Footer />
    </div>
  );
}
