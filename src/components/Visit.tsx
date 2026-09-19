import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { cn } from "../utils/cn";
import Reveal from "./Reveal";
import { LEAF } from "./Logo";
import { IMAGES } from "../data/content";
import { useSettings, createReservationBooking } from "../services/firestoreData";
import { Loader2, CheckCircle2 } from "lucide-react";

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
  const win = WINDOWS[today] || { open: 12, close: 22 };
  const open = h >= win.open && h < win.close;
  return { open, today, nextOpen: win.open };
}

export default function Visit() {
  const { open, today } = useOpenStatus();
  const { settings } = useSettings();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<null | {
    name: string;
    date: string;
    time: string;
    partySize: number;
  }>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const date = String(fd.get("date") || "");
    const time = String(fd.get("time") || "");
    const partySizeStr = String(fd.get("guests") || "2");
    const partySize = parseInt(partySizeStr.replace(/[^0-9]/g, "")) || 2;
    const notes = String(fd.get("notes") || "").trim();

    try {
      const result = await createReservationBooking({
        customerName: name,
        phone,
        email,
        partySize,
        date,
        time,
        notes,
      });

      if (!result.success) {
        setError(result.message);
        setSubmitting(false);
        return;
      }

      setSent({
        name,
        date,
        time,
        partySize,
      });
    } catch (err: any) {
      console.error("Booking error:", err);
      setError(err?.message || "Failed to submit booking. Please call us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  const hoursList = settings.storeHours || [];

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
                {hoursList.map((row, i) => {
                  const dayIdx = (i + 1) % 7;
                  const isToday = dayIdx === today;
                  return (
                    <li
                      key={row.day || i}
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
                Kitchen takes last orders 30 minutes before close. Every Hakka dish and biryani is crafted fresh to order.
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
                <p className="mt-4 text-sm font-light leading-relaxed text-cream/70">{settings.address}</p>
                <div className="mt-5 space-y-2.5 text-sm">
                  <a
                    href={`tel:${settings.phone.replace(/[^0-9]/g, "")}`}
                    className="block text-cream/85 hover:text-crimson-bright transition-colors"
                  >
                    {settings.phone}
                  </a>
                  <a
                    href={`mailto:${settings.email}`}
                    className="block text-cream/85 hover:text-crimson-bright transition-colors"
                  >
                    {settings.email}
                  </a>
                </div>
                <div className="mt-auto space-y-2 border-t border-cream/10 pt-5 text-xs font-light leading-relaxed text-cream/45">
                  <p>· Valet at the door after 5 PM</p>
                  <p>· Dedicated parking garage nearby on Yonge St</p>
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
                    Parties of 8 or more — call us directly at {settings.phone}. Or{" "}
                    <Link to="/booking" className="underline font-semibold text-cream hover:text-white">
                      view interactive calendar →
                    </Link>
                  </p>

                  {error && (
                    <div className="mt-3 p-2.5 bg-black/40 border border-white/20 text-xs text-cream rounded">
                      {error}
                    </div>
                  )}

                  <div className="mt-6 space-y-3">
                    <input
                      name="name"
                      required
                      placeholder="Full name"
                      className="w-full border border-cream/30 bg-ink/15 px-4 py-2.5 text-sm text-cream placeholder:text-cream/50 outline-none transition-colors focus:border-cream focus:bg-ink/25"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        name="phone"
                        type="tel"
                        required
                        placeholder="Phone number"
                        className="w-full border border-cream/30 bg-ink/15 px-4 py-2.5 text-sm text-cream placeholder:text-cream/50 outline-none transition-colors focus:border-cream focus:bg-ink/25"
                      />
                      <input
                        name="email"
                        type="email"
                        placeholder="Email address"
                        className="w-full border border-cream/30 bg-ink/15 px-4 py-2.5 text-sm text-cream placeholder:text-cream/50 outline-none transition-colors focus:border-cream focus:bg-ink/25"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        name="date"
                        type="date"
                        required
                        className="w-full border border-cream/30 bg-ink/15 px-4 py-2.5 text-sm text-cream outline-none transition-colors focus:border-cream focus:bg-ink/25 [color-scheme:dark]"
                      />
                      <select
                        name="time"
                        defaultValue="7:00 PM"
                        className="w-full border border-cream/30 bg-ink/15 px-4 py-2.5 text-sm text-cream outline-none transition-colors focus:border-cream focus:bg-ink/25 [color-scheme:dark]"
                      >
                        {["5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM"].map((t) => (
                          <option key={t} className="bg-ink text-cream">{t}</option>
                        ))}
                      </select>
                    </div>
                    <select
                      name="guests"
                      defaultValue="2 guests"
                      className="w-full border border-cream/30 bg-ink/15 px-4 py-2.5 text-sm text-cream outline-none transition-colors focus:border-cream focus:bg-ink/25 [color-scheme:dark]"
                    >
                      {["1 guest", "2 guests", "3 guests", "4 guests", "5 guests", "6 guests", "7 guests"].map((g) => (
                        <option key={g} className="bg-ink text-cream">{g}</option>
                      ))}
                    </select>
                    <input
                      name="notes"
                      placeholder="Special requests, dietary notes, occasion..."
                      className="w-full border border-cream/30 bg-ink/15 px-4 py-2 text-xs text-cream placeholder:text-cream/50 outline-none transition-colors focus:border-cream focus:bg-ink/25"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="group mt-6 inline-flex w-full items-center justify-center gap-3 bg-ink px-6 py-3.5 text-[11px] font-semibold tracking-[0.28em] uppercase text-cream transition-all duration-300 hover:bg-charcoal hover:shadow-[0_12px_35px_rgba(12,11,12,0.4)] disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-crimson-bright" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Request table
                        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M2 8h11M9 3.5 13.5 8 9 12.5" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>

                <div className="relative mt-6 border-t border-cream/25 pt-4 text-center">
                  <p className="text-[10px] font-medium tracking-[0.26em] uppercase text-cream/70">
                    Staying in tonight?
                  </p>
                  <a
                    href="#order"
                    className="mt-1.5 inline-flex items-center gap-2 text-xs font-bold text-cream underline-offset-4 transition-all hover:underline hover:decoration-2"
                  >
                    Order pickup or delivery →
                  </a>
                </div>
                </>
              ) : (
                <div className="relative flex h-full flex-col items-start justify-center text-cream fade-swap">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink">
                    <CheckCircle2 className="h-7 w-7 text-crimson-bright" />
                  </span>
                  <h3 className="mt-6 font-display text-3xl font-bold">
                    Reservation Request Received
                  </h3>
                  <p className="mt-3 text-sm font-light leading-relaxed text-cream/90">
                    Thank you, {sent.name}! Table for {sent.partySize} guests on {sent.date} at {sent.time}.
                    <br />
                    <span className="text-cream/75 text-xs block mt-2">
                      Reservation request received — we'll confirm shortly by phone/email.
                    </span>
                  </p>
                  <button
                    onClick={() => setSent(null)}
                    className="mt-8 border border-cream/40 px-6 py-3 text-[11px] font-semibold tracking-[0.26em] uppercase transition-all duration-300 hover:border-cream hover:bg-ink/20 cursor-pointer"
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
