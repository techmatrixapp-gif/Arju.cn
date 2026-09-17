import Reveal from "./Reveal";
import { LEAF } from "./Logo";
import { IMAGES } from "../data/content";

const STATS = [
  { value: "12", label: "Years on Yonge St." },
  { value: "60+", label: "Fresh-made dishes" },
  { value: "4", label: "Spice levels" },
  { value: "4.9", label: "Average guest rating" },
];

export default function Story() {
  return (
    <section id="story" className="paper relative bg-cream text-ink overflow-hidden">
      <span
        aria-hidden
        className="pointer-events-none absolute -left-10 bottom-10 select-none font-display font-black text-[22vw] leading-none text-transparent opacity-60"
        style={{ WebkitTextStroke: "1px rgba(20,19,20,0.08)" }}
      >
        ARJU
      </span>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 py-24 lg:py-32">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          {/* imagery */}
          <Reveal className="relative">
            <div className="relative ml-4 sm:ml-8">
              <div className="absolute -left-5 -top-5 h-full w-full border-2 border-crimson" aria-hidden />
              <div className="group relative overflow-hidden">
                <img
                  src={IMAGES.story}
                  alt="Chef placing a fresh pizza into the stone oven at ARJU"
                  className="aspect-[4/5] w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-10 -right-4 w-44 sm:w-56 border-4 border-cream shadow-[0_24px_60px_rgba(12,11,12,0.35)] sm:-right-10">
                <img
                  src={IMAGES.storySmall}
                  alt="Freshly layered chicken biryani"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
              <div className="absolute -top-9 right-6 flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full bg-crimson text-cream shadow-[0_16px_40px_rgba(200,16,46,0.4)]">
                <span className="text-center font-display text-sm leading-tight font-bold">
                  EST.<br />2016
                </span>
              </div>
            </div>
          </Reveal>

          {/* copy */}
          <div>
            <Reveal>
              <p className="mb-6 flex items-center gap-3 text-[11px] font-semibold tracking-[0.4em] uppercase text-crimson">
                <svg viewBox="0 0 100 130" className="h-4.5 w-3.5 fill-crimson">
                  <path d={LEAF} />
                </svg>
                Our story
                <span className="h-px w-14 bg-crimson" />
              </p>
              <h2 className="font-display text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-[3.4rem]">
                A world kitchen,{" "}
                <span className="italic font-semibold text-crimson">on one Toronto corner.</span>
              </h2>
            </Reveal>

            <Reveal delay={120}>
              <p className="mt-7 text-base sm:text-lg font-light leading-relaxed text-ink/75">
                ARJU opened its doors on Yonge Street in 2016 with a simple
                conviction: the food Toronto loves most is the food the world
                brought here. Under one roof you'll find the wok-tossed Hakka
                classics of Mumbai's streets, biryani slow-layered with aromatic
                rice, shawarma carved fresh off the spit, and pizzas pulled
                straight from the stone oven.
              </p>
              <p className="mt-5 text-base sm:text-lg font-light leading-relaxed text-ink/75">
                Everything is made to order — wraps come off the grill, sauces
                are built in the blazing wok, and every Hakka dish and biryani
                can be tuned to your heat: Mild, Medium, Spicy or Extra Spicy.
                Pull up a table, or order it to your door. Either way, it's made
                the way we'd feed family.
              </p>
            </Reveal>

            <Reveal delay={220}>
              <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-8 border-t-2 border-ink/10 pt-8 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                {STATS.map((s) => (
                  <div key={s.label}>
                    <p className="font-display text-4xl font-extrabold text-crimson sm:text-[2.6rem]">
                      {s.value}
                    </p>
                    <p className="mt-1.5 text-[11px] font-medium tracking-[0.18em] uppercase text-ink/55">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>

        {/* meet the chef */}
        <div className="mt-28 lg:mt-36">
          <Reveal>
            <div className="grid overflow-hidden bg-ink text-cream lg:grid-cols-5">
              <div className="group relative lg:col-span-2">
                <img
                  src={IMAGES.chef}
                  alt="The ARJU brigade plating dishes in the open kitchen"
                  className="h-72 w-full object-cover lg:h-full transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent lg:bg-gradient-to-r" />
                <span className="absolute left-5 top-5 bg-crimson px-3 py-1.5 text-[10px] font-semibold tracking-[0.3em] uppercase">
                  Meet the chef
                </span>
              </div>
              <div className="relative p-8 sm:p-12 lg:col-span-3 lg:p-16">
                <span className="pointer-events-none absolute right-6 top-2 font-display text-[7rem] font-black leading-none text-crimson/20 select-none">
                  02
                </span>
                <p className="text-[11px] font-semibold tracking-[0.4em] uppercase text-crimson-bright">
                  Chef Arjun Mehta
                </p>
                <h3 className="mt-4 font-display text-3xl font-bold leading-snug sm:text-4xl">
                  “Toronto eats like nowhere else on earth —{" "}
                  <em className="text-crimson-bright">so that's how we cook.”</em>
                </h3>
                <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-cream/70">
                  Arjun learned the wok in Mumbai's Hakka houses, the biryani
                  handi over slow Sunday afternoons at home, and the shawarma
                  spit while staging across the eastern Mediterranean. He
                  brought it all back to Yonge Street in 2016 — one open
                  kitchen, one blazing wok, and a menu that refuses to pick just
                  one country. The name ARJU is his own: a reminder that bold
                  food is for everyone at the table.
                </p>
                <p className="mt-6 font-display text-lg italic text-cream/85">
                  — Arjun Mehta, Executive Chef & Founder
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
