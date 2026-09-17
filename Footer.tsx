import { useState, type FormEvent } from "react";
import Logo, { LEAF } from "./Logo";
import { NAV_LINKS, PHONE, EMAIL, ADDRESS } from "../data/content";

const SOCIALS = [
  {
    label: "Instagram",
    path: "M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 4.7a5.1 5.1 0 1 0 0 10.2 5.1 5.1 0 0 0 0-10.2zm0 8.4a3.3 3.3 0 1 1 0-6.6 3.3 3.3 0 0 1 0 6.6zm6.5-8.6a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z",
  },
  {
    label: "Facebook",
    path: "M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z",
  },
  {
    label: "X",
    path: "M18.9 2.1h3.4l-7.4 8.5 8.7 11.5h-6.8l-5.3-7-6.1 7H1.9l7.9-9L1.5 2.1h7l4.8 6.3 5.6-6.3zm-1.2 18h1.9L7.4 4H5.4l12.3 16.1z",
  },
];

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false);

  const onSubscribe = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubscribed(true);
  };

  return (
    <footer className="relative bg-[#080808] text-cream">
      {/* big wordmark */}
      <div className="overflow-hidden border-b border-cream/10">
        <p
          aria-hidden
          className="pointer-events-none select-none whitespace-nowrap text-center font-display font-black leading-none text-transparent"
          style={{ fontSize: "clamp(6rem, 17vw, 15rem)", WebkitTextStroke: "1px rgba(245,240,232,0.09)", marginTop: "-0.18em" }}
        >
          ARJU · TASTE OF CANADA ·
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* brand */}
          <div>
            <Logo variant="full" tone="light" className="h-52 w-auto" />
            <p className="mt-5 max-w-xs text-sm font-light leading-relaxed text-cream/55">
              Toronto's home for wok-tossed Hakka classics, slow-layered
              biryani, grilled shawarma and stone-baked pizza — made fresh
              since 2016.
            </p>
            <div className="mt-6 flex gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href="#home"
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center border border-cream/20 text-cream/70 transition-all duration-300 hover:border-crimson hover:bg-crimson hover:text-cream"
                >
                  <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-current">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* explore */}
          <div>
            <h4 className="text-[11px] font-semibold tracking-[0.34em] uppercase text-crimson-bright">
              Explore
            </h4>
            <ul className="mt-6 space-y-3">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="group inline-flex items-center gap-2 text-sm text-cream/65 transition-colors hover:text-cream"
                  >
                    <span className="h-px w-4 bg-crimson/50 transition-all duration-300 group-hover:w-7 group-hover:bg-crimson-bright" />
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* contact */}
          <div>
            <h4 className="text-[11px] font-semibold tracking-[0.34em] uppercase text-crimson-bright">
              Contact
            </h4>
            <ul className="mt-6 space-y-4 text-sm text-cream/65">
              <li className="leading-relaxed">{ADDRESS}</li>
              <li>
                <a href={`tel:${PHONE.replace(/[^0-9]/g, "")}`} className="hover:text-cream transition-colors">
                  {PHONE}
                </a>
              </li>
              <li>
                <a href={`mailto:${EMAIL}`} className="hover:text-cream transition-colors">
                  {EMAIL}
                </a>
              </li>
              <li className="text-cream/45">
                Tue–Thu 5–10 PM · Fri–Sat 5–11 PM
                <br />
                Sun–Mon 12–9 PM
              </li>
            </ul>
          </div>

          {/* newsletter */}
          <div>
            <h4 className="text-[11px] font-semibold tracking-[0.34em] uppercase text-crimson-bright">
              The ARJU Letter
            </h4>
            <p className="mt-6 text-sm font-light leading-relaxed text-cream/55">
              Weekly specials, new momo drops and first dibs on feast nights.
              Once a month, no nonsense.
            </p>
            {subscribed ? (
              <p className="fade-swap mt-5 flex items-center gap-2.5 border border-crimson/50 bg-crimson/10 px-4 py-3.5 text-sm font-medium text-cream">
                <svg viewBox="0 0 100 130" className="h-4.5 w-3.5 fill-crimson-bright">
                  <path d={LEAF} />
                </svg>
                You're on the list. Bon appétit!
              </p>
            ) : (
              <form onSubmit={onSubscribe} className="mt-5 flex">
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  aria-label="Email address"
                  className="w-full border border-cream/20 bg-transparent px-4 py-3.5 text-sm text-cream placeholder:text-cream/35 outline-none transition-colors focus:border-crimson"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="shrink-0 border border-crimson bg-crimson px-4 text-cream transition-colors duration-300 hover:bg-crimson-bright"
                >
                  <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M2 8h11M9 3.5 13.5 8 9 12.5" />
                  </svg>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-6 text-[11px] tracking-[0.14em] uppercase text-cream/35 sm:flex-row sm:px-8 lg:px-10">
          <p>© 2026 ARJU Restaurant · Taste of Canada</p>
          <p className="flex items-center gap-2">
            Crafted with maple in Toronto
            <svg viewBox="0 0 100 130" className="h-3.5 w-2.5 fill-crimson">
              <path d={LEAF} />
            </svg>
          </p>
        </div>
      </div>
    </footer>
  );
}
