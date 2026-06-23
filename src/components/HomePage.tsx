import HeroSection from "@/components/HeroSection";
import HeroPropertySearch from "@/components/home/HeroPropertySearch";
import HomePageShell from "@/components/home/HomePageShell";
import HotPropertiesSlider from "@/components/home/HotPropertiesSlider";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import MortgageCalculator from "@/components/home/MortgageCalculator";
import type { Property } from "@/lib/types";
import type { Testimonial } from "@/lib/mock-data/testimonials";

interface HomePageProps {
  hotProperties: Property[];
  testimonials?: Testimonial[];
}

/**
 * Landing page section stack — visual sketch order:
 * Hero → Search → Hot Properties → Testimonials → Mortgage Calculator
 */
export default function HomePage({
  hotProperties,
  testimonials,
}: HomePageProps) {
  return (
    <HomePageShell>
      <div className="home-page-stack flex flex-col bg-white transition-colors duration-300 dark:bg-navy-950">
        <HeroSection />
        <HeroPropertySearch />
        <HotPropertiesSlider properties={hotProperties} />
        <TestimonialsSection testimonials={testimonials} />
        <MortgageCalculator />
      </div>
    </HomePageShell>
  );
}
