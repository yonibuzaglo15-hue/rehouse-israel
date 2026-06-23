import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HomePage from "@/components/HomePage";
import HomeLoginPrompt from "@/components/auth/HomeLoginPrompt";
import { Suspense } from "react";
import { MOCK_PROPERTIES } from "@/lib/mock-data/properties";
import { LANDING_TESTIMONIALS } from "@/lib/mock-data/landing-preview";

/** ISR — production uses catalog data; preview mock ensures a rich visual sketch */
export const revalidate = 300;

const HOT_PROPERTIES = MOCK_PROPERTIES.filter((property) => property.featured).slice(
  0,
  6
);

export default function Page() {
  return (
    <div dir="rtl" className="min-h-screen bg-white text-navy-950 transition-colors duration-300 dark:bg-navy-950 dark:text-white">
      <Header />
      <Suspense fallback={null}>
        <HomeLoginPrompt />
      </Suspense>
      <main className="overflow-x-hidden">
        <HomePage
          hotProperties={HOT_PROPERTIES}
          testimonials={LANDING_TESTIMONIALS}
        />
      </main>
      <Footer />
    </div>
  );
}
