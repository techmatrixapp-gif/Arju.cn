import { useState, useMemo } from "react";
import { cn } from "../utils/cn";
import Reveal from "./Reveal";
import { LEAF } from "./Logo";
import { useCart } from "../context/CartContext";
import { SIGNATURES } from "../data/content";
import { useCategories, useMenuItems } from "../services/firestoreData";

function AddSignature({ dish }: { dish: { id: string; name: string; price: number; img?: string; category?: string } }) {
  const { qtyOf, addItem, setQty } = useCart();
  const qty = qtyOf(dish.id);
  const price = Number(dish.price);

  if (qty === 0) {
    return (
      <button
        onClick={() =>
          addItem({
            id: dish.id,
            name: dish.name,
            price,
            img: dish.img || "",
            category: dish.category || "",
          })
        }
        className="inline-flex shrink-0 items-center gap-2 bg-crimson px-4 py-2.5 text-[10px] font-bold tracking-[0.2em] uppercase text-cream transition-all duration-300 hover:bg-crimson-bright cursor-pointer"
      >
        <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M8 3v10M3 8h10" strokeLinecap="round" />
        </svg>
        Add
      </button>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-1 bg-crimson p-1 text-cream">
      <button
        onClick={() => setQty(dish.id, qty - 1)}
        aria-label={`Remove one ${dish.name}`}
        className="flex h-8 w-8 items-center justify-center transition-colors hover:bg-ink/20 cursor-pointer"
      >
        <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M3 8h10" strokeLinecap="round" />
        </svg>
      </button>
      <span className="w-6 text-center text-sm font-semibold tabular-nums">{qty}</span>
      <button
        onClick={() => setQty(dish.id, qty + 1)}
        aria-label={`Add one ${dish.name}`}
        className="flex h-8 w-8 items-center justify-center transition-colors hover:bg-ink/20 cursor-pointer"
      >
        <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M8 3v10M3 8h10" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

function SectionEyebrow({ children, light = false }: { children: string; light?: boolean }) {
  return (
    <p
      className={cn(
        "mb-6 flex items-center gap-3 text-[11px] font-semibold tracking-[0.4em] uppercase",
        light ? "text-crimson-bright" : "text-crimson",
      )}
    >
      <svg viewBox="0 0 100 130" className={cn("h-4.5 w-3.5", light ? "fill-crimson-bright" : "fill-crimson")}>
        <path d={LEAF} />
      </svg>
      {children}
      <span className={cn("h-px w-14", light ? "bg-crimson-bright" : "bg-crimson")} />
    </p>
  );
}

const TAG_STYLES: Record<string, string> = {
  Popular: "bg-crimson text-cream",
  V: "border border-ink/30 text-ink/70",
  Spicy: "border border-crimson text-crimson",
};

function Tags({ tags }: { tags?: string[] }) {
  if (!tags || tags.length === 0) return null;
  return (
    <span className="flex shrink-0 flex-wrap justify-end gap-1.5 pt-0.5">
      {tags.map((tag) => (
        <span
          key={tag}
          className={cn(
            "px-2 py-0.5 text-[9px] font-semibold tracking-[0.16em] uppercase",
            TAG_STYLES[tag] ?? "border border-ink/30 text-ink/70",
          )}
        >
          {tag}
        </span>
      ))}
    </span>
  );
}

function PriceBlock({ item }: { item: any }) {
  if (item.variants && item.variants.length > 0) {
    return (
      <div className="shrink-0 text-right">
        {item.variants.map((p: any) => (
          <p key={p.label} className="flex items-baseline justify-end gap-2 text-sm leading-tight sm:text-base">
            <span className="text-[10px] font-medium tracking-wide text-ink/45">{p.label}</span>
            <span className="font-display font-bold text-crimson tabular-nums">${Number(p.price).toFixed(2)}</span>
          </p>
        ))}
      </div>
    );
  }
  return (
    <p className="shrink-0 font-display text-lg font-bold text-crimson sm:text-xl tabular-nums">
      ${Number(item.price).toFixed(2)}
    </p>
  );
}

function MenuRow({ item, index }: { item: any; index: number }) {
  return (
    <div className="fade-swap" style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}>
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-display text-lg font-bold leading-snug sm:text-xl">{item.name}</h3>
        <span className="leader" aria-hidden />
        <PriceBlock item={item} />
      </div>
      {(item.description || item.desc || item.tags) && (
        <div className="mt-1 flex items-start justify-between gap-4">
          <p className="max-w-md text-sm font-light leading-relaxed text-ink/60">
            {item.description || item.desc}
          </p>
          <Tags tags={item.tags} />
        </div>
      )}
    </div>
  );
}

/* ---------------- signatures ---------------- */

function Signatures({ items }: { items: any[] }) {
  // Pick popular or first 4 featured items
  const featured = useMemo(() => {
    const popularItems = items.filter((i) => i.popular);
    if (popularItems.length >= 4) {
      return popularItems.slice(0, 4);
    }
    return SIGNATURES;
  }, [items]);

  return (
    <section className="relative bg-ink text-cream overflow-hidden">
      <div className="pointer-events-none absolute -right-40 top-0 h-[480px] w-[480px] rounded-full bg-crimson/15 blur-[130px]" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 py-24 lg:py-28">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-8">
          <Reveal>
            <SectionEyebrow light>House favourites</SectionEyebrow>
            <h2 className="font-display text-4xl font-extrabold leading-tight sm:text-5xl">
              The plates the line is <em className="text-crimson-bright">waiting for.</em>
            </h2>
          </Reveal>
          <Reveal delay={150} className="max-w-sm">
            <p className="text-sm font-light leading-relaxed text-cream/65">
              Four dishes that put ARJU on the map — biryani layered to order,
              Hakka straight from the wok, and shawarma carved fresh.
            </p>
          </Reveal>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {featured.map((dish, i) => (
            <Reveal key={dish.id} delay={i * 110}>
              <article className="group relative overflow-hidden border border-cream/10 bg-coal">
                <div className="relative overflow-hidden">
                  <img
                    src={dish.imageUrl || dish.img}
                    alt={dish.name}
                    className="aspect-[4/5] w-full object-cover transition-transform duration-[1.1s] ease-out group-hover:scale-[1.07]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
                  <span className="absolute left-4 top-4 bg-crimson px-3 py-1.5 text-[9px] font-semibold tracking-[0.26em] uppercase text-cream">
                    {dish.tags?.[0] || dish.tag || "Signature"}
                  </span>
                </div>
                <div className="relative p-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-xl font-bold leading-snug">{dish.name}</h3>
                    <p className="font-display text-2xl font-bold text-crimson-bright tabular-nums">
                      <span className="mr-0.5 align-top text-xs">$</span>
                      {Number(dish.price).toFixed(2)}
                    </p>
                  </div>
                  <p className="mt-3 text-sm font-light leading-relaxed text-cream/60 line-clamp-2">
                    {dish.description || dish.desc}
                  </p>
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <span className="block h-0.5 w-10 bg-crimson transition-all duration-500 group-hover:w-full" />
                    <AddSignature dish={{
                      id: dish.id,
                      name: dish.name,
                      price: Number(dish.price),
                      img: dish.imageUrl || dish.img,
                      category: dish.categoryId,
                    }} />
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

/* ---------------- full menu ---------------- */

function Menu({ categories, items }: { categories: any[]; items: any[] }) {
  const visibleCategories = useMemo(
    () => categories.filter((c) => c.visible !== false),
    [categories]
  );

  const [activeTab, setActiveTab] = useState<string>("");

  const currentTabId = activeTab || visibleCategories[0]?.id || "";
  const currentCategory = visibleCategories.find((c) => c.id === currentTabId) || visibleCategories[0];

  const currentItems = useMemo(() => {
    if (!currentCategory) return [];
    return items.filter((item) => item.categoryId === currentCategory.id);
  }, [items, currentCategory]);

  return (
    <section id="menu" className="paper relative bg-cream text-ink">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10 py-24 lg:py-32">
        <Reveal className="text-center">
          <div className="flex justify-center">
            <SectionEyebrow>The menu</SectionEyebrow>
          </div>
          <h2 className="font-display text-4xl font-extrabold leading-tight sm:text-5xl">
            From the wok, the handi <em className="text-crimson">& the oven.</em>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base font-light leading-relaxed text-ink/65">
            Stone-baked pizza, slow-layered biryani, wok-tossed Hakka classics
            and shawarma carved to order — every dish made fresh. Choose your
            heat: Mild, Medium, Spicy or Extra Spicy.
          </p>
        </Reveal>

        {/* tabs */}
        <Reveal delay={120}>
          <div className="mt-12 flex flex-wrap justify-center gap-2.5 sm:gap-3">
            {visibleCategories.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  "px-4 py-3 text-[10px] font-semibold tracking-[0.18em] uppercase transition-all duration-300 sm:px-6 sm:text-[11px] cursor-pointer",
                  currentTabId === t.id
                    ? "bg-ink text-cream shadow-[0_10px_30px_rgba(12,11,12,0.35)]"
                    : "border border-ink/20 text-ink/70 hover:border-crimson hover:text-crimson",
                )}
              >
                {t.name || t.label}
              </button>
            ))}
          </div>
        </Reveal>

        {/* items */}
        <div key={currentTabId} className="mt-12">
          {currentCategory?.blurb && (
            <p className="text-center text-xs text-ink/50 italic mb-8 -mt-4">
              {currentCategory.blurb}
            </p>
          )}

          {currentItems.length > 0 ? (
            currentItems.map((item, i) => (
              <div key={item.id} className="mb-6 border-b border-ink/10 pb-6">
                <MenuRow item={item} index={i} />
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-xs text-ink/50">
              Dishes in this category are being prepared fresh.
            </div>
          )}
        </div>

        {/* tab note + spice levels */}
        <Reveal>
          <div className="mt-10 space-y-3">
            <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-sm font-medium text-crimson">
              <span className="text-[11px] font-semibold tracking-[0.3em] uppercase text-ink/50">
                Choose your spice level
              </span>
              <span>Mild</span>
              <span className="text-ink/30">|</span>
              <span>Medium</span>
              <span className="text-ink/30">|</span>
              <span>Spicy</span>
              <span className="text-ink/30">|</span>
              <span>Extra Spicy</span>
            </p>
          </div>
        </Reveal>

        {/* order / book dual CTA */}
        <Reveal delay={120}>
          <div className="mt-14 grid overflow-hidden bg-ink text-cream sm:grid-cols-2">
            <div className="relative flex flex-col justify-center gap-4 p-8 sm:p-10">
              <span className="pointer-events-none absolute right-5 top-2 select-none font-display text-6xl font-black text-crimson/20">
                🍁
              </span>
              <h3 className="font-display text-2xl font-bold leading-snug sm:text-3xl">
                Want it at home tonight?
              </h3>
              <p className="max-w-sm text-sm font-light leading-relaxed text-cream/65">
                Order pickup or delivery straight from our kitchen — ready in
                20 minutes, free delivery over $50.
              </p>
              <a
                href="#order"
                className="inline-flex w-fit items-center gap-3 bg-crimson px-7 py-3.5 text-[11px] font-semibold tracking-[0.26em] uppercase transition-colors duration-300 hover:bg-crimson-bright"
              >
                Order online
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M2 8h11M9 3.5 13.5 8 9 12.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
            <div className="flex flex-col justify-center gap-4 border-t border-cream/10 bg-coal p-8 sm:border-l sm:border-t-0 sm:p-10">
              <h3 className="font-display text-2xl font-bold leading-snug sm:text-3xl">
                Eating in instead?
              </h3>
              <p className="max-w-sm text-sm font-light leading-relaxed text-cream/65">
                Book the red booth, the chef's counter, or a big table for your
                group — the grill, the wok and the oven will be ready.
              </p>
              <a
                href="#visit"
                className="inline-flex w-fit items-center gap-3 border border-cream/35 px-7 py-3.5 text-[11px] font-semibold tracking-[0.26em] uppercase transition-all duration-300 hover:border-cream hover:bg-cream/10"
              >
                Book a table
              </a>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <p className="mt-10 border-t-2 border-ink/10 pt-6 text-center text-xs font-medium tracking-[0.14em] uppercase text-ink/45">
            Prices in CAD · spice level on every Hakka dish &amp; biryani · please tell us about allergies
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export default function MenuSection() {
  const { categories } = useCategories();
  const { items } = useMenuItems();

  return (
    <>
      <Signatures items={items} />
      <Menu categories={categories} items={items} />
    </>
  );
}
