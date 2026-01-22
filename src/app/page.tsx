import { Header, Footer } from "@/components/layout";
import {
  Hero,
  FrameworksSection,
  Pricing,
  Testimonials,
  FooterCTA,
} from "@/components/landing";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <Hero />
        <FrameworksSection />
        <Pricing />
        <Testimonials />
        <FooterCTA />
      </main>

      <Footer />
    </div>
  );
}
