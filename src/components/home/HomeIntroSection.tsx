import { HOME_INTRO, HERO_AREA_CARDS } from "@/lib/hero-content";

export default function HomeIntroSection() {
  return (
    <section
      className="home-intro-section relative z-20 border-b border-navy-100 bg-white px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20 dark:border-white/10 dark:bg-navy-950"
      aria-labelledby="home-intro-heading"
    >
      <div className="mx-auto max-w-5xl text-center">
        <h1
          id="home-intro-heading"
          className="font-display text-[1.65rem] font-bold leading-snug tracking-tight text-navy-900 sm:text-4xl lg:text-5xl dark:text-white"
        >
          {HOME_INTRO.headline}
        </h1>

        <p className="mx-auto mt-4 max-w-3xl font-display text-sm font-light leading-relaxed text-navy-600 sm:mt-5 sm:text-base md:text-lg dark:text-white/75">
          {HOME_INTRO.subtitle}
        </p>

        <div className="mt-10 grid gap-4 text-start sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-5">
          {HERO_AREA_CARDS.map((card) => (
            <article
              key={card.id}
              className="home-intro-card rounded-2xl border border-navy-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <p className="font-display text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-gold-600 dark:text-gold-400">
                {card.city}
              </p>
              <h2 className="mt-1.5 font-display text-base font-semibold text-navy-900 sm:text-lg dark:text-white">
                {card.area}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-navy-600 dark:text-white/65">
                {card.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
