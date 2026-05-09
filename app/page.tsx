import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { UseCases } from "@/components/UseCases";
import { Features } from "@/components/Features";
import { CallToAction } from "@/components/CallToAction";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen text-slate-900 selection:bg-teal-100 selection:text-teal-900">
      <Header />
      <Hero />
      <HowItWorks />
      <UseCases />
      <Features />
      <CallToAction />
      <Footer />
    </div>
  );
}
