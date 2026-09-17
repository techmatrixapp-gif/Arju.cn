import { LEAF } from "./Logo";
import { IMAGES, PHONE } from "../data/content";

function CircularBadge() {
  return (
    <div className="relative h-40 w-40 lg:h-44 lg:w-44">
      <svg viewBox="0 0 160 160" className="absolute inset-0 spin-slow">
        <defs>
          <path id="badge-circ" d="M80 80 m-58 0 a58 58 0 1 1 116 0 a58 58 0 1 1 -116 0" fill="none" />
        </defs>
        <text fill="rgba(245,240,232,0.75)" fontSize="10.5" letterSpacing="3.2" fontFamily="'Jost', sans-serif" fontWeight="500">
          <textPath href="#badge-circ">
            TASTE OF CANADA · ARJU TORONTO · EST. 2016 ·
          </textPath>
        </text>
      </svg>
      <svg viewBox="0 0 100 130" className="absolute inset-0 m-auto h-12 w-9">
        <path d={LEAF} fill="#C8102E" />
      </svg>
    </div>
  );
}

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen overflow-hidden bg-ink">
      {/* backdrop */}
      <div className="absolute inset-0">
        <img
          src={IMAGES.hero}
          alt="Wok-tossed Hakka noodles with peppers and herbs at ARJU"
          className="h-full w-full object-cover kenburns"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/75 to-ink/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/60" />
        <div className="absolute -left-40 top-1/3 h-[560px] w-[560px] rounded-full bg-crimson/25 blur-[150px]" />
      </div>

      {/* giant watermark */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 top-1/4 hidden select-none font-display font-black text-[26vw] leading-none text-transparent lg:block"
        style={{ WebkitTextStroke: "1px rgba(245,240,232,0.07)" }}
      >
        ARJU
      </span>

      {/* vertical side label */}
      <span
        aria-hidden
        className="absolute right-8 top-1/2 hidden -translate-y-1/2 rotate-90 text-[10px] tracking-[0.6em] uppercase text-cream/35 xl:block"
      >
        Wok · Spit · Stone Oven · Wok
      </span>

      {/* content */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-5 sm:px-8 lg:px-10 pt-36 pb-28">
        <div className="max-w-3xl">
          <p className="mb-7 flex items-center gap-4 text-[11px] font-medium tracking-[0.4em] uppercase text-cream/80">
            <svg viewBox="0 0 100 130" className="h-5 w-4 fill-crimson-bright">
              <path d={LEAF} />
            </svg>
            Est. 2016 — Downtown Toronto
            <span className="hidden sm:block h-px w-16 bg-crimson-bright" />
          </p>

          <h1 className="font-display font-extrabold leading-[1.02] text-cream text-5xl sm:text-7xl lg:text-[5.6rem]">
            <span className="line-mask" style={{ "--d": "0.15s" } as React.CSSProperties}>
              <span>Hakka heat,</span>
            </span>
            <span className="line-mask" style={{ "--d": "0.32s" } as React.CSSProperties}>
              <span className="italic font-semibold text-crimson-bright">shawarma soul,</span>
            </span>
            <span className="line-mask" style={{ "--d": "0.49s" } as React.CSSProperties}>
              <span>made in Toronto.</span>
            </span>
          </h1>

          <p
            className="mt-7 max-w-xl text-base sm:text-lg font-light leading-relaxed text-cream/75 opacity-0 animate-[fade-swap_0.9s_0.75s_cubic-bezier(0.19,1,0.22,1)_forwards]"
          >
            Stone-baked pizza, slow-layered biryani, wok-tossed Hakka noodles and
            shawarma carved fresh off the spit — the flavours our city loves,
            made to order on Yonge Street and delivered hot to your door.
          </p>

          <div
            className="mt-10 flex flex-wrap items-center gap-4 opacity-0 animate-[fade-swap_0.9s_0.95s_cubic-bezier(0.19,1,0.22,1)_forwards]"
          >
            <a
              href="#order"
              className="group inline-flex items-center gap-3 bg-crimson px-7 py-4 text-[11px] font-semibold tracking-[0.28em] uppercase text-cream transition-all duration-300 hover:bg-crimson-bright hover:shadow-[0_10px_36px_rgba(200,16,46,0.5)] sm:px-8"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 8h12l-1 12.5H7L6 8Z" strokeLinejoin="round" />
                <path d="M9 8V6.5a3 3 0 0 1 6 0V8" strokeLinecap="round" />
              </svg>
              Order online
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M2 8h11M9 3.5 13.5 8 9 12.5" />
              </svg>
            </a>
            <a
              href="#visit"
              className="inline-flex items-center gap-3 border border-cream/35 px-7 py-4 text-[11px] font-semibold tracking-[0.28em] uppercase text-cream transition-all duration-300 hover:border-cream hover:bg-cream/10 sm:px-8"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
                <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
                <path d="M3.5 9.5h17M8 3v4M16 3v4" strokeLinecap="round" />
                <path d="M7.5 13.5h3v3h-3z" />
              </svg>
              Book a table
            </a>
            <a
              href="#menu"
              className="w-full text-left text-xs font-medium tracking-[0.2em] uppercase text-cream/55 underline-offset-4 transition-colors hover:text-crimson-bright hover:underline sm:w-auto sm:pl-2"
            >
              or browse biryani, wraps &amp; pizza →
            </a>
          </div>

          {/* tonight strip */}
          <div
            className="mt-14 flex flex-wrap items-center gap-x-10 gap-y-4 opacity-0 animate-[fade-swap_0.9s_1.15s_cubic-bezier(0.19,1,0.22,1)_forwards]"
          >
            <div className="flex items-center gap-3">
              <span className="pulse-dot h-2.5 w-2.5 rounded-full bg-crimson-bright" />
              <div>
                <p className="text-[10px] tracking-[0.34em] uppercase text-stone">Tonight</p>
                <p className="text-sm font-medium text-cream">Kitchen open · 5:00 PM — 11:00 PM</p>
              </div>
            </div>
            <div className="hidden sm:block h-8 w-px bg-cream/20" />
            <div>
              <p className="text-[10px] tracking-[0.34em] uppercase text-stone">Reservations</p>
              <a href={`tel:${PHONE.replace(/[^0-9]/g, "")}`} className="text-sm font-medium text-cream hover:text-crimson-bright transition-colors">
                {PHONE}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* rotating badge */}
      <div className="absolute bottom-24 right-8 z-10 hidden lg:block xl:right-16">
        <CircularBadge />
      </div>

      {/* scroll cue */}
      <a
        href="#story"
        aria-label="Scroll to story"
        className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 text-cream/60 hover:text-crimson-bright transition-colors md:flex"
      >
        <span className="text-[9px] tracking-[0.5em] uppercase">Scroll</span>
        <span className="relative h-12 w-px overflow-hidden bg-cream/20">
          <span className="absolute inset-x-0 top-0 h-5 bg-crimson-bright animate-[scrollcue_1.8s_ease-in-out_infinite]" />
        </span>
      </a>
      <style>{`@keyframes scrollcue { 0% { transform: translateY(-100%);} 60% { transform: translateY(200%);} 100% { transform: translateY(200%);} } @media (prefers-reduced-motion: reduce){ .animate-\\[scrollcue\\_1\\.8s\\_ease-in-out\\_infinite\\] { animation: none !important; } }`}</style>
    </section>
  );
}
