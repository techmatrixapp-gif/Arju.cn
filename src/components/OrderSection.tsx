import { useState, useMemo } from "react";
import { cn } from "../utils/cn";
import Reveal from "./Reveal";
import { LEAF } from "./Logo";
import { useCart } from "../context/CartContext";
import { ORDER_FEES } from "../data/content";
import { useCategories, useMenuItems } from "../services/firestoreData";

const cad = (n: number) => n.toFixed(2);
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/* single-item add / stepper */

function QtyControl({ item, category }: { item: any; category: string }) {
  const { qtyOf, setQty, addItem } = useCart();
  const qty = qtyOf(item.id);

  if (qty === 0) {
    return (
      <button
        onClick={() =>
          addItem({ id: item.id, name: item.name, price: Number(item.price), img: item.imageUrl || item.img, category })
        }
        aria-label={`Add ${item.name} to order`}
        className="group/btn flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-crimson text-cream transition-all duration-300 hover:bg-crimson-bright hover:shadow-[0_8px_22px_rgba(200,16,46,0.45)] cursor-pointer"
      >
        <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 3v10M3 8h10" strokeLinecap="round" />
        </svg>
      </button>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-1 rounded-full bg-crimson p-1 text-cream">
      <button
        onClick={() => setQty(item.id, qty - 1)}
        aria-label="Decrease quantity"
        className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-ink/20 cursor-pointer"
      >
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M3 8h10" strokeLinecap="round" />
        </svg>
      </button>
      <span className="w-6 text-center text-sm font-semibold tabular-nums">{qty}</span>
      <button
        onClick={() => setQty(item.id, qty + 1)}
        aria-label="Increase quantity"
        className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-ink/20 cursor-pointer"
      >
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M8 3v10M3 8h10" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

/* size-variant stepper (pizzas, wraps, plates, pasta) */

function VariantButton({
  item,
  variant,
  category,
}: {
  item: any;
  variant: { label: string; price: number };
  category: string;
}) {
  const { qtyOf, setQty, addItem } = useCart();
  const lineId = `${item.id}-${slug(variant.label)}`;
  const qty = qtyOf(lineId);

  if (qty === 0) {
    return (
      <button
        onClick={() =>
          addItem({
            id: lineId,
            name: `${item.name} · ${variant.label}`,
            price: Number(variant.price),
            img: item.imageUrl || item.img,
            category,
          })
        }
        aria-label={`Add ${item.name} ${variant.label} to order`}
        className="group/v flex items-center gap-3 border border-cream/20 px-3.5 py-2 text-[11px] font-semibold tracking-[0.12em] uppercase transition-all duration-300 hover:border-crimson-bright hover:bg-crimson cursor-pointer"
      >
        <span className="flex flex-col items-start leading-tight normal-case tracking-normal">
          <span className="text-xs font-semibold">{variant.label}</span>
          <span className="font-display text-sm font-bold tabular-nums">${cad(Number(variant.price))}</span>
        </span>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-crimson text-cream transition-colors duration-300 group-hover/v:bg-cream group-hover/v:text-crimson">
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M8 3v10M3 8h10" strokeLinecap="round" />
          </svg>
        </span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-crimson px-2 py-1.5 text-cream">
      <button
        onClick={() => setQty(lineId, qty - 1)}
        aria-label={`Remove one ${item.name} ${variant.label}`}
        className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-ink/20 cursor-pointer"
      >
        <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M3 8h10" strokeLinecap="round" />
        </svg>
      </button>
      <span className="min-w-10 text-left text-[11px] font-semibold leading-tight">
        <span className="block tabular-nums">{qty} × {variant.label}</span>
        <span className="block font-normal opacity-75 tabular-nums">${cad(Number(variant.price))}</span>
      </span>
      <button
        onClick={() => setQty(lineId, qty + 1)}
        aria-label={`Add one ${item.name} ${variant.label}`}
        className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-ink/20 cursor-pointer"
      >
        <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M8 3v10M3 8h10" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

function ItemCard({ item, category, index }: { item: any; category: string; index: number }) {
  const hasVariants = item.variants && item.variants.length > 0;

  return (
    <article
      className="fade-swap group flex gap-4 border border-cream/10 bg-ink/50 p-3.5 transition-all duration-300 hover:border-crimson/50 hover:bg-ink/80 sm:gap-5 sm:p-4"
      style={{ animationDelay: `${(index % 10) * 45}ms` }}
    >
      <div className="relative h-24 w-24 shrink-0 overflow-hidden sm:h-28 sm:w-28 bg-charcoal">
        {(item.imageUrl || item.img) ? (
          <img
            src={item.imageUrl || item.img}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[1.1s] ease-out group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] text-stone">ARJU</div>
        )}
        {item.popular && (
          <span className="absolute left-1.5 top-1.5 bg-crimson px-2 py-0.5 text-[8px] font-bold tracking-[0.18em] uppercase text-cream">
            Popular
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-base font-bold leading-snug sm:text-lg">
            {item.name}
            {(item.tags?.[0] || item.tag) && (
              <span className="ml-2 align-middle border border-cream/25 px-1.5 py-px text-[8px] font-semibold tracking-[0.16em] uppercase text-cream/60">
                {item.tags?.[0] || item.tag}
              </span>
            )}
          </h3>
          {!hasVariants && (
            <p className="shrink-0 font-display text-lg font-bold text-crimson-bright tabular-nums">
              <span className="mr-px align-top text-[10px]">$</span>
              {cad(Number(item.price))}
            </p>
          )}
          {hasVariants && (
            <p className="shrink-0 pt-1 text-[10px] font-semibold tracking-[0.18em] uppercase text-cream/45">
              from ${cad(Math.min(...item.variants.map((v: any) => Number(v.price))))}
            </p>
          )}
        </div>
        <p className="mt-1 line-clamp-2 text-xs font-light leading-relaxed text-cream/55 sm:text-sm">
          {item.description || item.desc}
        </p>
        <div className="mt-auto flex flex-wrap items-center justify-end gap-2 pt-2.5">
          {hasVariants ? (
            item.variants.map((v: any) => (
              <VariantButton key={v.label} item={item} variant={v} category={category} />
            ))
          ) : (
            <QtyControl item={item} category={category} />
          )}
        </div>
      </div>
    </article>
  );
}

const INFO_CHIPS = [
  {
    title: "Pickup",
    detail: "Ready in 20–25 min",
    icon: "M8 2a6 6 0 0 0-6 6c0 4.5 6 10 6 10s6-5.5 6-10a6 6 0 0 0-6-6Zm0 8.2A2.2 2.2 0 1 1 8 5.8a2.2 2.2 0 0 1 0 4.4Z",
  },
  {
    title: "Delivery",
    detail: "35–50 min · Downtown Toronto",
    icon: "M1 3h10v9H1zM11 6h3l2 3v3h-5zM4 14a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm9 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z",
  },
  {
    title: "Free delivery",
    detail: `Orders over $${ORDER_FEES.FREE_DELIVERY_OVER}`,
    icon: "M8 1v14M1 8h14",
  },
];

export default function OrderSection() {
  const { categories } = useCategories();
  const { items } = useMenuItems();

  const visibleCategories = useMemo(
    () => categories.filter((c) => c.visible !== false),
    [categories]
  );

  const [activeTab, setActiveTab] = useState<string>("");
  const currentTabId = activeTab || visibleCategories[0]?.id || "";
  const currentCategory = visibleCategories.find((c) => c.id === currentTabId) || visibleCategories[0];

  const currentItems = useMemo(() => {
    if (!currentCategory) return [];
    return items.filter(
      (item) => item.categoryId === currentCategory.id && item.available !== false
    );
  }, [items, currentCategory]);

  return (
    <section id="order" className="relative bg-coal text-cream overflow-hidden">
      <div className="pointer-events-none absolute -left-48 top-1/3 h-[520px] w-[520px] rounded-full bg-crimson/12 blur-[140px]" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 py-24 lg:py-32">
        <Reveal>
          <p className="mb-6 flex items-center gap-3 text-[11px] font-semibold tracking-[0.4em] uppercase text-crimson-bright">
            <svg viewBox="0 0 100 130" className="h-4.5 w-3.5 fill-crimson-bright">
              <path d={LEAF} />
            </svg>
            Direct online ordering
            <span className="h-px w-14 bg-crimson-bright" />
          </p>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2 className="font-display text-4xl font-extrabold leading-tight sm:text-5xl">
                Order pickup or delivery.
              </h2>
              <p className="mt-3 max-w-xl text-base font-light leading-relaxed text-cream/70">
                Fresh out of the wok, handi and oven. Packed hot, sealed with care, straight to your door or ready at the counter.
              </p>
            </div>

            {/* info chips */}
            <div className="flex flex-wrap gap-2.5">
              {INFO_CHIPS.map((c) => (
                <div
                  key={c.title}
                  className="flex items-center gap-2.5 border border-cream/15 bg-ink/60 px-3.5 py-2 backdrop-blur-sm"
                >
                  <span className="text-crimson-bright font-bold">✓</span>
                  <div className="text-left leading-tight">
                    <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-cream">
                      {c.title}
                    </p>
                    <p className="text-[11px] text-cream/60">{c.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* category tabs */}
        <Reveal delay={100}>
          <div className="mt-12 flex items-center gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {visibleCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={cn(
                  "shrink-0 px-4 py-2.5 text-[11px] font-semibold tracking-[0.16em] uppercase transition-all duration-300 sm:px-5 sm:py-3 cursor-pointer",
                  currentTabId === cat.id
                    ? "bg-crimson text-cream shadow-[0_8px_24px_rgba(200,16,46,0.45)]"
                    : "border border-cream/15 bg-ink/40 text-cream/75 hover:border-crimson-bright hover:text-cream",
                )}
              >
                {cat.name || cat.label}
              </button>
            ))}
          </div>
        </Reveal>

        {/* category blurb */}
        {currentCategory?.blurb && (
          <p className="mt-6 text-sm font-light text-cream/65">
            {currentCategory.blurb}
          </p>
        )}

        {/* items grid */}
        <div key={currentTabId} className="mt-8 grid gap-4 md:grid-cols-2 lg:gap-5">
          {currentItems.map((item, i) => (
            <ItemCard key={item.id} item={item} category={currentCategory?.name || ""} index={i} />
          ))}
        </div>

        {currentItems.length === 0 && (
          <div className="py-16 text-center text-xs text-stone">
            All dishes in this category are currently sold out or being updated. Check back shortly!
          </div>
        )}
      </div>
    </section>
  );
}
