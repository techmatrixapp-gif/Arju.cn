import { useEffect, useState } from "react";
import { cn } from "../utils/cn";
import Logo from "./Logo";
import { useCart } from "../context/CartContext";
import { NAV_LINKS, PHONE, ADDRESS } from "../data/content";

function BagIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M6 8h12l-1 12.5H7L6 8Z" strokeLinejoin="round" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" strokeLinecap="round" />
    </svg>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");
  const { count, openCart } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // lightweight scroll-spy
  useEffect(() => {
    const ids = NAV_LINKS.map((l) => l.href.slice(1));
    const onScroll = () => {
      const pos = window.scrollY + window.innerHeight * 0.4;
      let current = "home";
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= pos) current = id;
      });
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // lock body scroll when the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      {/* info strip */}
      <div
        className={cn(
          "hidden md:flex items-center justify-between px-6 lg:px-10 py-2 text-[11px] tracking-[0.18em] uppercase transition-all duration-500 overflow-hidden",
          scrolled
            ? "max-h-0 py-0 opacity-0"
            : "max-h-10 opacity-100 bg-ink/70 backdrop-blur-md border-b border-cream/10",
        )}
      >
        <p className="text-stone">
          {ADDRESS.split(",")[0]} · Toronto
        </p>
        <p className="text-stone hidden lg:block">
          Tue–Thu 5–10 PM · Fri–Sat 5–11 PM · Sun–Mon 12–9 PM
        </p>
        <a href={`tel:${PHONE.replace(/[^0-9]/g, "")}`} className="text-cream hover:text-crimson-bright transition-colors">
          {PHONE}
        </a>
      </div>

      {/* main bar */}
      <nav
        className={cn(
          "flex items-center justify-between px-5 sm:px-8 lg:px-10 transition-all duration-500",
          scrolled
            ? "bg-ink/92 backdrop-blur-lg py-3 shadow-[0_10px_40px_rgba(0,0,0,0.55)] border-b border-crimson/25"
            : "bg-transparent py-5",
        )}
      >
        <a href="#home" className="flex items-center gap-3 group" aria-label="ARJU home">
          <Logo variant="mark" className="h-11 w-auto sm:h-12 transition-transform duration-500 group-hover:scale-105" />
          <span className="hidden sm:flex flex-col leading-none">
            <span className="font-display font-bold text-xl tracking-[0.14em] text-cream">ARJU</span>
            <span className="text-[9px] tracking-[0.42em] text-crimson-bright font-medium mt-1">
              TASTE OF CANADA
            </span>
          </span>
        </a>

        {/* desktop links */}
        <ul className="hidden xl:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={cn(
                  "relative text-[11px] font-medium tracking-[0.28em] uppercase transition-colors duration-300",
                  "after:absolute after:left-0 after:-bottom-1.5 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-crimson-bright after:transition-transform after:duration-300 hover:after:scale-x-100",
                  active === link.href.slice(1)
                    ? "text-crimson-bright after:scale-x-100"
                    : "text-cream/85 hover:text-cream",
                )}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <a
            href="#visit"
            className="hidden xl:inline-flex items-center gap-2 border border-cream/35 px-6 py-3 text-[11px] font-semibold tracking-[0.24em] uppercase text-cream transition-all duration-300 hover:border-cream hover:bg-cream/10"
          >
            Reserve
          </a>
          <a
            href="#order"
            className="inline-flex items-center gap-2 bg-crimson hover:bg-crimson-bright text-cream text-[10px] sm:text-[11px] font-semibold tracking-[0.2em] sm:tracking-[0.24em] uppercase px-4 py-2.5 sm:px-6 sm:py-3 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(200,16,46,0.45)]"
          >
            <BagIcon className="h-4 w-4" />
            Order online
          </a>

          {/* cart */}
          <button
            onClick={openCart}
            aria-label={`Open your order, ${count} item${count === 1 ? "" : "s"}`}
            className="relative flex h-11 w-11 items-center justify-center border border-cream/25 bg-ink/40 text-cream backdrop-blur transition-colors hover:border-crimson-bright"
          >
            <BagIcon className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-crimson-bright px-1 text-[10px] font-bold tabular-nums">
                {count}
              </span>
            )}
          </button>

          {/* burger */}
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="xl:hidden relative z-50 flex h-11 w-11 flex-col items-center justify-center gap-1.5 border border-cream/25 bg-ink/40 backdrop-blur hover:border-crimson-bright transition-colors"
          >
            <span className="h-px w-5 bg-cream" />
            <span className="h-px w-5 bg-crimson-bright" />
            <span className="h-px w-5 bg-cream" />
          </button>
        </div>
      </nav>

      {/* mobile overlay */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 z-40 transition-all duration-500",
          open ? "visible opacity-100" : "invisible opacity-0 pointer-events-none",
        )}
      >
        <div className="absolute inset-0 bg-ink/97 backdrop-blur-xl" />
        <button
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className="absolute top-6 right-6 z-10 flex h-11 w-11 items-center justify-center border border-cream/25 text-cream hover:border-crimson-bright transition-colors"
        >
          <svg viewBox="0 0 20 20" className="w-4 h-4" stroke="currentColor" strokeWidth="1.6">
            <path d="M4 4l12 12M16 4L4 16" />
          </svg>
        </button>

        <div className="relative h-full flex flex-col justify-center px-10 overflow-y-auto">
          <ul className="space-y-2">
            {NAV_LINKS.map((link, i) => (
              <li
                key={link.href}
                style={{ transitionDelay: `${open ? 120 + i * 70 : 0}ms` }}
                className={cn(
                  "transition-all duration-500",
                  open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
                )}
              >
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "group flex items-baseline gap-4 py-2.5 font-display text-4xl sm:text-5xl",
                    active === link.href.slice(1) ? "text-crimson-bright" : "text-cream",
                  )}
                >
                  <span className="text-xs font-body text-stone tracking-widest w-7">
                    0{i + 1}
                  </span>
                  <span className="group-hover:italic group-hover:text-crimson-bright transition-colors duration-300">
                    {link.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <div
            style={{ transitionDelay: open ? "600ms" : "0ms" }}
            className={cn(
              "mt-10 border-t border-cream/15 pt-6 transition-all duration-500",
              open ? "opacity-100" : "opacity-0",
            )}
          >
            <div className="grid grid-cols-2 gap-3">
              <a
                href="#order"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-2 bg-crimson px-4 py-3.5 text-[11px] font-semibold tracking-[0.22em] uppercase text-cream transition-colors hover:bg-crimson-bright"
              >
                <BagIcon className="h-4 w-4" />
                Order online
              </a>
              <a
                href="#visit"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center border border-cream/35 px-4 py-3.5 text-[11px] font-semibold tracking-[0.22em] uppercase text-cream transition-colors hover:bg-cream/10"
              >
                Book a table
              </a>
            </div>
            <p className="text-[11px] tracking-[0.3em] uppercase text-stone mt-6 mb-2">
              Or call us
            </p>
            <a
              href={`tel:${PHONE.replace(/[^0-9]/g, "")}`}
              className="font-display text-2xl text-cream hover:text-crimson-bright transition-colors"
            >
              {PHONE}
            </a>
            <p className="mt-3 text-sm text-stone">{ADDRESS}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
