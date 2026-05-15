import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { UseCases } from "@/components/UseCases";
import { Features } from "@/components/Features";
import { CallToAction } from "@/components/CallToAction";
import { Footer } from "@/components/Footer";
import ComparisonPage from "@/components/Comparison";
import Pricing from "@/components/Pricing";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#ecfff1] text-slate-900 selection:bg-teal-100 selection:text-teal-900">
      <Header />
      <Hero />
      <HowItWorks />
      <UseCases />
      <Features />
      <Pricing />
      <ComparisonPage />
      <CallToAction />
      <Footer />
    </div>
  );
}
