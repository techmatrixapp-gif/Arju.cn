import { useEffect, useRef, useState } from "react";
import { cn } from "../utils/cn";
import Reveal from "./Reveal";
import { LEAF } from "./Logo";
import { TESTIMONIALS } from "../data/content";

function excerpt(text: string) {
  const raw = text
    .split("—")[0]
    .split(". ")
    .slice(0, 2)
    .join(". ")
    .trim();
  return raw.endsWith(".") ? raw : raw + ".";
}

function Stars({ count, className = "h-4 w-4" }: { count: number; className?: string }) {
  return (
    <span className="flex gap-1" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className={cn(className, i < count ? "fill-crimson" : "fill-ink/20")}
        >
          <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z" />
        </svg>
      ))}
    </span>
  );
}

export default function Testimonials() {
  const [idx, setIdx] = useState(0);
  const timer = useRef<number | null>(null);

  const start = () => {
    stop();
    timer.current = window.setInterval(
      () => setIdx((i) => (i + 1) % TESTIMONIALS.length),
      6000,
    );
  };
  const stop = () => {
    if (timer.current) window.clearInterval(timer.current);
  };

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    start();
    return stop;
  }, []);

  const featured = TESTIMONIALS[idx];

  return (
    <section id="reviews" className="paper relative bg-cream text-ink overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 py-24 lg:py-32">
        <Reveal className="text-center">
          <div className="flex justify-center">
            <p className="mb-6 flex items-center gap-3 text-[11px] font-semibold tracking-[0.4em] uppercase text-crimson">
              <svg viewBox="0 0 100 130" className="h-4.5 w-3.5 fill-crimson">
                <path d={LEAF} />
              </svg>
              Best in the city, that's what people say
              <span className="h-px w-14 bg-crimson" />
            </p>
          </div>
          <h2 className="font-display text-4xl font-extrabold leading-tight sm:text-5xl">
            800+ five-star nights, <em className="text-crimson">and counting.</em>
          </h2>
          <div className="mt-6 inline-flex items-center gap-3 border-2 border-ink/10 bg-white/40 px-5 py-2.5">
            <span className="font-display text-2xl font-extrabold text-crimson">4.9</span>
            <Stars count={5} />
            <span className="text-xs font-medium tracking-[0.16em] uppercase text-ink/55">
              on Google · 832 reviews
            </span>
          </div>
        </Reveal>

        {/* rotating featured review */}
        <Reveal delay={120}>
          <div
            className="relative mt-14 bg-ink px-7 py-12 text-cream sm:px-14 sm:py-16"
            onMouseEnter={stop}
            onMouseLeave={start}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute left-6 top-4 select-none font-display text-[7rem] leading-none text-crimson/25"
            >
              “
            </span>
            <div key={idx} className="fade-swap relative">
              <p className="max-w-3xl font-display text-xl font-medium italic leading-relaxed text-cream/90 sm:text-2xl lg:text-[1.7rem]">
                {featured.text}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-crimson font-display text-base font-bold">
                  {featured.initials}
                </span>
                <div>
                  <p className="text-sm font-semibold tracking-wide">{featured.name}</p>
                  <p className="text-xs text-cream/55">
                    Google review · {featured.when}
                  </p>
                </div>
                <Stars count={featured.stars} className="ml-auto h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-8 flex gap-2.5">
              {TESTIMONIALS.map((t, i) => (
                <button
                  key={t.name}
                  aria-label={`Show review by ${t.name}`}
                  onClick={() => {
                    setIdx(i);
                    start();
                  }}
                  className={cn(
                    "h-1.5 transition-all duration-400",
                    i === idx ? "w-10 bg-crimson-bright" : "w-5 bg-cream/25 hover:bg-cream/50",
                  )}
                />
              ))}
            </div>
          </div>
        </Reveal>

        {/* review cards */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 120}>
              <article className="group flex h-full flex-col border-2 border-ink/10 bg-white/50 p-7 transition-all duration-400 hover:-translate-y-1.5 hover:border-crimson hover:shadow-[0_18px_45px_rgba(12,11,12,0.14)]">
                <div className="flex items-center justify-between">
                  <Stars count={t.stars} />
                  <span className="text-[10px] font-medium tracking-[0.18em] uppercase text-ink/40">
                    {t.when}
                  </span>
                </div>
                <p className="mt-4 flex-1 text-sm font-light leading-relaxed text-ink/70">
                  “{excerpt(t.text)}”
                </p>
                <div className="mt-6 flex items-center gap-3 border-t border-ink/10 pt-5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink font-display text-xs font-bold text-cream group-hover:bg-crimson transition-colors duration-300">
                    {t.initials}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-[11px] tracking-[0.14em] uppercase text-ink/45">
                      Verified guest
                    </p>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
