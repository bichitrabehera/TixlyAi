import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { UseCases } from "@/components/UseCases";
import { Features } from "@/components/Features";
import { CallToAction } from "@/components/CallToAction";
import { Footer } from "@/components/Footer";
import ComparisonPage from "@/components/Comparison";

export default function Home() {
  return (
    <div className="bg-[#ecfff1]">
      <Header />
      <Hero />
      <HowItWorks />
      <UseCases />
      <Features />
      <ComparisonPage />
      <CallToAction />
      <Footer />
    </div>
  );
}
