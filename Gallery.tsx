import Reveal from "./Reveal";
import { LEAF } from "./Logo";
import { GALLERY } from "../data/content";

export default function Gallery() {
  return (
    <section id="gallery" className="relative bg-ink text-cream overflow-hidden">
      <div className="pointer-events-none absolute -left-40 top-1/4 h-[440px] w-[440px] rounded-full bg-crimson/12 blur-[130px]" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 py-24 lg:py-28">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-8">
          <Reveal>
            <p className="mb-6 flex items-center gap-3 text-[11px] font-semibold tracking-[0.4em] uppercase text-crimson-bright">
              <svg viewBox="0 0 100 130" className="h-4.5 w-3.5 fill-crimson-bright">
                <path d={LEAF} />
              </svg>
              Gallery
              <span className="h-px w-14 bg-crimson-bright" />
            </p>
            <h2 className="font-display text-4xl font-extrabold leading-tight sm:text-5xl">
              Evenings at <em className="text-crimson-bright">ARJU.</em>
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <a
              href="#visit"
              className="group inline-flex items-center gap-3 border border-cream/30 px-6 py-3.5 text-[11px] font-semibold tracking-[0.26em] uppercase transition-all duration-300 hover:border-crimson-bright hover:bg-crimson/10"
            >
              Come see for yourself
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M2 8h11M9 3.5 13.5 8 9 12.5" />
              </svg>
            </a>
          </Reveal>
        </div>

        <div className="columns-2 gap-4 md:columns-3 [column-fill:_balance]">
          {GALLERY.map((g, i) => (
            <Reveal key={g.src} delay={(i % 3) * 100} className="mb-4 break-inside-avoid">
              <figure className="group relative overflow-hidden border border-cream/10">
                <img
                  src={g.src}
                  alt={g.caption}
                  loading="lazy"
                  className="w-full object-cover transition-transform duration-[1.1s] ease-out group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-100" />
                <span className="absolute left-4 top-4 font-display text-sm font-bold text-crimson-bright opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <figcaption className="absolute inset-x-0 bottom-0 translate-y-3 p-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <span className="text-xs font-medium tracking-[0.22em] uppercase text-cream">
                    {g.caption}
                  </span>
                  <span className="mt-2 block h-0.5 w-8 bg-crimson-bright" />
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
