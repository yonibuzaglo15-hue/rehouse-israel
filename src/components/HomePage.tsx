import HeroSection from "@/components/HeroSection";
import ContactSection from "@/components/ContactSection";
import AgentSection from "@/components/AgentSection";
import PropertySearchSection from "@/components/PropertySearchSection";

export default function HomePage() {
  return (
    <div className="home-page-stack flex flex-col">
      <HeroSection />
      <ContactSection />
      <AgentSection />
      <PropertySearchSection />
    </div>
  );
}
