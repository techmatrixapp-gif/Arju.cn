import { useEffect } from "react";
import { Link } from "react-router-dom";
import Reveal from "../components/Reveal";
import { IMAGES } from "../data/content";
import { useSiteContent } from "../services/firestoreData";
import { Flame, Wheat, Award } from "lucide-react";

export default function AboutPage() {
  const { content } = useSiteContent();

  useEffect(() => {
    document.title = "Our Story & Culinary Heritage — ARJU Toronto";
  }, []);

  return (
    <div className="pt-28 pb-20 bg-ink text-cream">
      {/* Header */}
      <section className="relative px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto text-center border-b border-white/10 pb-16">
        <Reveal>
          <div className="flex items-center justify-center gap-3 text-crimson-bright mb-3">
            <span className="h-px w-8 bg-crimson" />
            <span className="text-[11px] tracking-[0.35em] uppercase font-semibold">
              Heritage & Craft
            </span>
            <span className="h-px w-8 bg-crimson" />
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-cream">
            Our Story on Yonge Street
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-stone text-sm sm:text-base leading-relaxed">
            {content.aboutFounders ||
              "Born out of a deep passion for charcoal flame cooking and artisanal dough, ARJU brings together Toronto's multicultural culinary tapestry under one roof."}
          </p>
        </Reveal>
      </section>

      {/* Narrative Section */}
      <section className="px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto py-20 border-b border-white/10">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <Reveal>
            <div className="space-y-6 text-stone text-sm sm:text-base leading-relaxed">
              <span className="text-[10px] tracking-[0.35em] uppercase font-bold text-crimson-bright block">
                The Philosophy
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-cream">
                Where East Flame Meets Mediterranean Craft
              </h2>
              <p>
                {content.aboutText ||
                  "At ARJU, we believe the best food stems from patience, honest ingredients, and time-honoured techniques. We don't take shortcuts: our pizza dough undergoes a 48-hour cold fermentation process, our chicken shawarma is hand-stacked and spit-roasted daily, and our biryanis are sealed in clay handis to lock in every note of saffron and green cardamom."}
              </p>
              <p>
                Every meat served is 100% Halal certified, sourced from trusted regional purveyors.
                Whether you stop by for a quick lunch wrap between classes at TMU or gather with
                family for a feast of woodstone pizzas and sizzling pastas, our doors at 429 Yonge
                Street are always open to you.
              </p>
              <div className="pt-4 flex items-center gap-6">
                <div>
                  <span className="font-display text-3xl font-bold text-cream">100%</span>
                  <p className="text-xs uppercase tracking-wider text-stone mt-1">Halal Certified</p>
                </div>
                <div className="h-8 w-px bg-white/15" />
                <div>
                  <span className="font-display text-3xl font-bold text-cream">48 hrs</span>
                  <p className="text-xs uppercase tracking-wider text-stone mt-1">Dough Ferment</p>
                </div>
                <div className="h-8 w-px bg-white/15" />
                <div>
                  <span className="font-display text-3xl font-bold text-cream">600°F</span>
                  <p className="text-xs uppercase tracking-wider text-stone mt-1">Stone Oven</p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="relative">
              <div className="relative h-[480px] w-full overflow-hidden border border-white/15 shadow-2xl">
                <img
                  src={IMAGES.story}
                  alt="ARJU Dining Interior"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 border border-crimson/40 bg-coal p-6 max-w-xs shadow-xl hidden sm:block">
                <p className="font-display text-lg font-bold text-cream">
                  429 Yonge Street, Toronto
                </p>
                <p className="text-xs text-stone mt-1">
                  Heart of downtown Toronto, serving guests 7 days a week.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Culinary Pillars Strip */}
      <section className="px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto py-20 border-b border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] tracking-[0.35em] uppercase font-bold text-crimson-bright block mb-2">
            The Kitchen Pillars
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-cream">
            Our Cooking Standards
          </h2>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          <div className="border border-white/10 bg-coal p-8 space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-crimson/15 text-crimson-bright border border-crimson/30">
              <Flame className="h-6 w-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-cream">Live Fire & Wok Hei</h3>
            <p className="text-xs text-stone leading-relaxed">
              High heat searing and traditional rotating spits give our shawarmas and woks that
              unmistakable smoky depth and tenderness.
            </p>
          </div>

          <div className="border border-white/10 bg-coal p-8 space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-crimson/15 text-crimson-bright border border-crimson/30">
              <Wheat className="h-6 w-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-cream">Old-World Fermentation</h3>
            <p className="text-xs text-stone leading-relaxed">
              We never rush our dough. 48 hours of slow, cold resting breaks down starches for an
              airy, crisp crust that is delightfully digestible.
            </p>
          </div>

          <div className="border border-white/10 bg-coal p-8 space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-crimson/15 text-crimson-bright border border-crimson/30">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-cream">Zero Compromise Halal</h3>
            <p className="text-xs text-stone leading-relaxed">
              Strictly certified Halal meats, fresh seasonal vegetables, and scratch-made sauces
              free of artificial flavours or preservatives.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-6 sm:px-10 lg:px-16 max-w-4xl mx-auto py-16 text-center">
        <h2 className="font-display text-3xl font-bold text-cream">Ready to Experience ARJU?</h2>
        <p className="mt-3 text-sm text-stone">
          Explore our complete menu online or book your table for dinner tonight.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/menu"
            className="bg-crimson hover:bg-crimson-bright px-6 py-3 text-xs font-semibold tracking-widest uppercase text-cream transition-colors"
          >
            Explore Menu
          </Link>
          <Link
            to="/booking"
            className="border border-cream/35 hover:border-cream bg-cream/10 px-6 py-3 text-xs font-semibold tracking-widest uppercase text-cream transition-colors"
          >
            Book a Table
          </Link>
        </div>
      </section>
    </div>
  );
}
