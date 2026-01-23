import { Header, Footer } from "@/components/layout";
import {
  HeroWithExplainer,
  Pricing,
  FooterCTA,
} from "@/components/landing";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <HeroWithExplainer />
        <Pricing />
        <FooterCTA />
      </main>

      <Footer />
    </div>
  );
}
