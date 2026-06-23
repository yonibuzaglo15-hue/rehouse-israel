import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import { NEW_PROJECTS, PROJECT_STATUS_LABELS } from "@/lib/mock-data/projects";
import { formatPrice } from "@/lib/constants";

export const metadata: Metadata = {
  title: "פרוייקטים חדשים",
  description: "פרויקטי נדל״ן חדשים באשדוד, אשקלון, יבנה וגן יבנה — הרשמה מוקדמת ובנייה.",
};

export default function ProjectsPage() {
  return (
    <>
      <Header />
      <main>
        <PageHero
          title="פרוייקטים חדשים"
          subtitle="הזדמנויות השקעה ומגורים בפרויקטים חדשים בדרום — מהרשמה מוקדמת ועד אכלוס"
        />

        <section className="relative py-16 sm:py-20">
          <div className="absolute inset-0 bg-navy-950" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-2">
              {NEW_PROJECTS.map((project) => (
                <article
                  key={project.id}
                  className="glass-panel group overflow-hidden rounded-2xl transition-all hover:border-gold-500/25"
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={project.image}
                      alt={project.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-transparent to-transparent" />
                    <span className="absolute start-4 top-4 rounded-full border border-gold-500/40 bg-gold-500/15 px-3 py-1 text-xs font-medium text-gold-200">
                      {PROJECT_STATUS_LABELS[project.status]}
                    </span>
                  </div>

                  <div className="p-6">
                    <h2 className="font-display text-xl font-bold text-white">{project.name}</h2>
                    <p className="mt-1 text-sm text-white/50">
                      {project.city} · {project.neighborhood}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-white/65">{project.description}</p>

                    <div className="mt-5 flex flex-wrap gap-4 text-sm">
                      <div>
                        <span className="text-white/40">החל מ-</span>{" "}
                        <span className="font-display font-semibold text-gold-300">
                          {formatPrice(project.priceFrom, "buy")}
                        </span>
                      </div>
                      <div className="text-white/50">
                        {project.roomsRange} חדרים · אכלוס {project.deliveryDate}
                      </div>
                    </div>

                    <Link
                      href="/contact"
                      className="luxury-btn-primary mt-6 inline-flex w-full justify-center sm:w-auto"
                    >
                      פרטים נוספים
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
