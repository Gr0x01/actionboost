import { Header, Footer } from "@/components/layout";
import {
  HeroWithExplainer,
  ResearchProof,
  Objections,
  Pricing,
  FooterCTA,
} from "@/components/landing";
import { OrganizationSchema, ProductSchema } from "@/components/seo";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <OrganizationSchema />
      <ProductSchema />
      <Header />

      <main className="flex-1">
        {/* 1. Hero + chaos → clarity transformation */}
        <HeroWithExplainer />

        {/* 2. Real research vs AI guessing */}
        <ResearchProof />

        {/* 3. Handle objections directly */}
        <Objections />

        {/* 4. Pricing with value stack */}
        <Pricing />

        {/* 5. Final push */}
        <FooterCTA />
      </main>

      <Footer />
    </div>
  );
}
