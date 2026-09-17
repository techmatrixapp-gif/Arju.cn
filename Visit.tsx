import { useState, type FormEvent } from "react";
import { cn } from "../utils/cn";
import Reveal from "./Reveal";
import { LEAF } from "./Logo";
import { HOURS, PHONE, EMAIL, ADDRESS, IMAGES } from "../data/content";

/* hours indexed by Date.getDay(): 0 = Sunday */
const WINDOWS: { open: number; close: number }[] = [
  { open: 12, close: 21 }, // Sun
  { open: 17, close: 22 }, // Mon
  { open: 17, close: 22 },
  { open: 17, close: 22 },
  { open: 17, close: 23 },
  { open: 17, close: 23 },
  { open: 12, close: 23 }, // Sat
];

function useOpenStatus() {
  const now = new Date();
  const today = now.getDay();
  const h = now.getHours() + now.getMinutes() / 60;
  const win = WINDOWS[today];
  const open = h >= win.open && h < win.close;
  return { open, today, nextOpen: win.open };
}

export default function Visit() {
  const { open, today } = useOpenStatus();
  const [sent, setSent] = useState<null | {
    name: string;
    date: string;
    time: string;
    guests: string;
  }>(null);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSent({
      name: String(fd.get("name") || "friend"),
      date: String(fd.get("date") || ""),
      time: String(fd.get("time") || ""),
      guests: String(fd.get("guests") || "2"),
    });
  };

  return (
    <section id="visit" className="relative bg-ink text-cream overflow-hidden">
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-crimson/15 blur-[140px]" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 py-24 lg:py-32">
        <div className="mb-14 max-w-2xl">
          <Reveal>
            <p className="mb-6 flex items-center gap-3 text-[11px] font-semibold tracking-[0.4em] uppercase text-crimson-bright">
              <svg viewBox="0 0 100 130" className="h-4.5 w-3.5 fill-crimson-bright">
                <path d={LEAF} />
              </svg>
              Visit & reserve
              <span className="h-px w-14 bg-crimson-bright" />
            </p>
            <h2 className="font-display text-4xl font-extrabold leading-tight sm:text-5xl">
              Pull up a chair. <em className="text-crimson-bright">The maple's</em> already on the table.
            </h2>
          </Reveal>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* hours */}
          <Reveal>
            <div className="h-full border border-cream/12 bg-coal p-8">
              <h3 className="font-display text-2xl font-bold">Hours</h3>
              <p
                className={cn(
                  "mt-3 inline-flex items-center gap-2.5 text-[11px] font-semibold tracking-[0.24em] uppercase",
                  open ? "text-crimson-bright" : "text-stone",
                )}
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    open ? "bg-crimson-bright pulse-dot" : "bg-stone/50",
                  )}
                />
                {open ? "Open right now" : "Closed for the evening"}
              </p>
              <ul className="mt-7 space-y-1">
                {HOURS.map((row, i) => {
                  const dayIdx = (i + 1) % 7; // list starts Monday
                  const isToday = dayIdx === today;
                  return (
                    <li
                      key={row.day}
                      className={cn(
                        "flex items-center justify-between px-3 py-2.5 text-sm transition-colors",
                        isToday ? "bg-crimson/15 text-cream" : "text-cream/60",
                      )}
                    >
                      <span className="flex items-center gap-2.5">
                        {isToday && <span className="h-1.5 w-1.5 rounded-full bg-crimson-bright" />}
                        {row.day}
                      </span>
                      <span className={cn("tracking-wide", isToday && "font-semibold")}>{row.hours}</span>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-6 border-t border-cream/10 pt-5 text-xs font-light leading-relaxed text-cream/45">
                Kitchen takes last orders 30 minutes before close. Every Hakka
                dish and biryani is available Mild, Medium, Spicy or Extra
                Spicy.
              </p>
            </div>
          </Reveal>

          {/* find us */}
          <Reveal delay={120}>
            <div className="flex h-full flex-col border border-cream/12 bg-coal">
              <div className="group relative h-44 overflow-hidden">
                <img
                  src={IMAGES.visit}
                  alt="ARJU dining room"
                  className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-coal via-ink/30 to-transparent" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <svg viewBox="0 0 24 24" className="h-11 w-11 fill-crimson-bright drop-shadow-[0_6px_14px_rgba(224,25,53,0.6)]">
                    <path d="M12 2a7.5 7.5 0 0 0-7.5 7.5C4.5 15 12 22 12 22s7.5-7 7.5-12.5A7.5 7.5 0 0 0 12 2zm0 10.2a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4z" />
                  </svg>
                </span>
              </div>
              <div className="flex flex-1 flex-col p-8">
                <h3 className="font-display text-2xl font-bold">Find us</h3>
                <p className="mt-4 text-sm font-light leading-relaxed text-cream/70">{ADDRESS}</p>
                <div className="mt-5 space-y-2.5 text-sm">
                  <a
                    href={`tel:${PHONE.replace(/[^0-9]/g, "")}`}
                    className="block text-cream/85 hover:text-crimson-bright transition-colors"
                  >
                    {PHONE}
                  </a>
                  <a
                    href={`mailto:${EMAIL}`}
                    className="block text-cream/85 hover:text-crimson-bright transition-colors"
                  >
                    {EMAIL}
                  </a>
                </div>
                <div className="mt-auto space-y-2 border-t border-cream/10 pt-5 text-xs font-light leading-relaxed text-cream/45">
                  <p>· Valet at the door after 5 PM</p>
                  <p>· PCC parking garage at 245 Yonge St</p>
                  <p>· Step-free access, dog-friendly patio</p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* reservation */}
          <Reveal delay={240}>
            <div className="relative h-full overflow-hidden bg-crimson p-8">
              <span
                aria-hidden
                className="pointer-events-none absolute -right-8 -top-10 select-none font-display text-[9rem] font-black leading-none text-ink/10"
              >
                A
              </span>
              {!sent ? (
                <>
                <form onSubmit={onSubmit} className="relative flex h-full flex-col">
                  <h3 className="font-display text-2xl font-bold text-cream">Reserve a table</h3>
                  <p className="mt-2 text-xs font-light text-cream/75">
                    Parties of 8 or more — call us directly at {PHONE}.
                  </p>
                  <div className="mt-6 space-y-3.5">
                    <input
                      name="name"
                      required
                      placeholder="Full name"
                      className="w-full border border-cream/30 bg-ink/15 px-4 py-3 text-sm text-cream placeholder:text-cream/50 outline-none transition-colors focus:border-cream focus:bg-ink/25"
                    />
                    <input
                      name="phone"
                      type="tel"
                      required
                      placeholder="Phone number"
                      className="w-full border border-cream/30 bg-ink/15 px-4 py-3 text-sm text-cream placeholder:text-cream/50 outline-none transition-colors focus:border-cream focus:bg-ink/25"
                    />
                    <div className="grid grid-cols-2 gap-3.5">
                      <input
                        name="date"
                        type="date"
                        required
                        className="w-full border border-cream/30 bg-ink/15 px-4 py-3 text-sm text-cream outline-none transition-colors focus:border-cream focus:bg-ink/25 [color-scheme:dark]"
                      />
                      <select
                        name="time"
                        defaultValue="7:00 PM"
                        className="w-full border border-cream/30 bg-ink/15 px-4 py-3 text-sm text-cream outline-none transition-colors focus:border-cream focus:bg-ink/25 [color-scheme:dark]"
                      >
                        {["5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM"].map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <select
                      name="guests"
                      defaultValue="2 guests"
                      className="w-full border border-cream/30 bg-ink/15 px-4 py-3 text-sm text-cream outline-none transition-colors focus:border-cream focus:bg-ink/25 [color-scheme:dark]"
                    >
                      {["1 guest", "2 guests", "3 guests", "4 guests", "5 guests", "6 guests", "7 guests"].map((g) => (
                        <option key={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="group mt-7 inline-flex w-full items-center justify-center gap-3 bg-ink px-6 py-4 text-[11px] font-semibold tracking-[0.28em] uppercase text-cream transition-all duration-300 hover:bg-charcoal hover:shadow-[0_12px_35px_rgba(12,11,12,0.4)]"
                  >
                    Request table
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M2 8h11M9 3.5 13.5 8 9 12.5" />
                    </svg>
                  </button>
                </form>
                <div className="relative mt-6 border-t border-cream/25 pt-5 text-center">
                  <p className="text-[10px] font-medium tracking-[0.26em] uppercase text-cream/70">
                    Staying in tonight?
                  </p>
                  <a
                    href="#order"
                    className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-cream underline-offset-4 transition-all hover:underline hover:decoration-2"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M6 8h12l-1 12.5H7L6 8Z" strokeLinejoin="round" />
                      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" strokeLinecap="round" />
                    </svg>
                    Order pickup or delivery →
                  </a>
                </div>
                </>
              ) : (
                <div className="relative flex h-full flex-col items-start justify-center text-cream fade-swap">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink">
                    <svg viewBox="0 0 24 24" className="h-7 w-7 stroke-crimson-bright" fill="none" strokeWidth="2.4">
                      <path d="M4.5 12.5l5 5 10-11" />
                    </svg>
                  </span>
                  <h3 className="mt-6 font-display text-3xl font-bold">
                    See you soon, {sent.name.split(" ")[0]}.
                  </h3>
                  <p className="mt-3 text-sm font-light leading-relaxed text-cream/85">
                    Table for {sent.guests} · {sent.date} at {sent.time}.
                    <br />
                    We'll text a confirmation within the hour.
                  </p>
                  <button
                    onClick={() => setSent(null)}
                    className="mt-8 border border-cream/40 px-6 py-3 text-[11px] font-semibold tracking-[0.26em] uppercase transition-all duration-300 hover:border-cream hover:bg-ink/20"
                  >
                    Make another booking
                  </button>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
