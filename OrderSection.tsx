import { useState } from "react";
import { cn } from "../utils/cn";
import Reveal from "./Reveal";
import { LEAF } from "./Logo";
import { useCart } from "../context/CartContext";
import {
  ORDER_CATEGORIES,
  ORDER_FEES,
  type OrderItem,
  type OrderVariant,
} from "../data/content";

const cad = (n: number) => n.toFixed(2);
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/* single-item add / stepper */

function QtyControl({ item, category }: { item: OrderItem; category: string }) {
  const { qtyOf, setQty, addItem } = useCart();
  const qty = qtyOf(item.id);

  if (qty === 0) {
    return (
      <button
        onClick={() =>
          addItem({ id: item.id, name: item.name, price: item.price, img: item.img, category })
        }
        aria-label={`Add ${item.name} to order`}
        className="group/btn flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-crimson text-cream transition-all duration-300 hover:bg-crimson-bright hover:shadow-[0_8px_22px_rgba(200,16,46,0.45)]"
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
        className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-ink/20"
      >
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M3 8h10" strokeLinecap="round" />
        </svg>
      </button>
      <span className="w-6 text-center text-sm font-semibold tabular-nums">{qty}</span>
      <button
        onClick={() => setQty(item.id, qty + 1)}
        aria-label="Increase quantity"
        className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-ink/20"
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
  item: OrderItem;
  variant: OrderVariant;
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
            price: variant.price,
            img: item.img,
            category,
          })
        }
        aria-label={`Add ${item.name} ${variant.label} to order`}
        className="group/v flex items-center gap-3 border border-cream/20 px-3.5 py-2 text-[11px] font-semibold tracking-[0.12em] uppercase transition-all duration-300 hover:border-crimson-bright hover:bg-crimson"
      >
        <span className="flex flex-col items-start leading-tight normal-case tracking-normal">
          <span className="text-xs font-semibold">{variant.label}</span>
          <span className="font-display text-sm font-bold tabular-nums">${cad(variant.price)}</span>
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
        className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-ink/20"
      >
        <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M3 8h10" strokeLinecap="round" />
        </svg>
      </button>
      <span className="min-w-10 text-left text-[11px] font-semibold leading-tight">
        <span className="block tabular-nums">{qty} × {variant.label}</span>
        <span className="block font-normal opacity-75 tabular-nums">${cad(variant.price)}</span>
      </span>
      <button
        onClick={() => setQty(lineId, qty + 1)}
        aria-label={`Add one ${item.name} ${variant.label}`}
        className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-ink/20"
      >
        <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M8 3v10M3 8h10" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

function ItemCard({ item, category, index }: { item: OrderItem; category: string; index: number }) {
  return (
    <article
      className="fade-swap group flex gap-4 border border-cream/10 bg-ink/50 p-3.5 transition-all duration-300 hover:border-crimson/50 hover:bg-ink/80 sm:gap-5 sm:p-4"
      style={{ animationDelay: `${(index % 10) * 45}ms` }}
    >
      <div className="relative h-24 w-24 shrink-0 overflow-hidden sm:h-28 sm:w-28">
        <img
          src={item.img}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[1.1s] ease-out group-hover:scale-110"
        />
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
            {item.tag && (
              <span className="ml-2 align-middle border border-cream/25 px-1.5 py-px text-[8px] font-semibold tracking-[0.16em] uppercase text-cream/60">
                {item.tag}
              </span>
            )}
          </h3>
          {!item.variants && (
            <p className="shrink-0 font-display text-lg font-bold text-crimson-bright tabular-nums">
              <span className="mr-px align-top text-[10px]">$</span>
              {cad(item.price)}
            </p>
          )}
          {item.variants && (
            <p className="shrink-0 pt-1 text-[10px] font-semibold tracking-[0.18em] uppercase text-cream/45">
              from ${cad(Math.min(...item.variants.map((v) => v.price)))}
            </p>
          )}
        </div>
        <p className="mt-1 line-clamp-2 text-xs font-light leading-relaxed text-cream/55 sm:text-sm">
          {item.desc}
        </p>
        <div className="mt-auto flex flex-wrap items-center justify-end gap-2 pt-2.5">
          {item.variants ? (
            item.variants.map((v) => (
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
    icon: "M3 6h11v8H3zM14 9h2.5l-2 3H14zM7 17.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm8 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z",
  },
  {
    title: "Free delivery",
    detail: `On orders over $${ORDER_FEES.FREE_DELIVERY_OVER}`,
    icon: "M12 2 4 5v6c0 4.5 3.4 8.4 8 11 4.6-2.6 8-6.5 8-11V5l-8-3Zm-1.2 12.6L7.4 11l1.4-1.4 2 2 4-4.1L16.2 9l-5.4 5.6Z",
  },
];

const SPICE_CATEGORIES = new Set([
  "order-biryani",
  "order-noodles",
  "order-starters",
  "order-gravy",
]);

export default function OrderSection() {
  const [tab, setTab] = useState(ORDER_CATEGORIES[0].id);
  const current = ORDER_CATEGORIES.find((c) => c.id === tab) ?? ORDER_CATEGORIES[0];

  return (
    <section id="order" className="relative overflow-hidden bg-coal text-cream">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-crimson to-transparent" />
      <div className="pointer-events-none absolute -left-40 top-1/3 h-[460px] w-[460px] rounded-full bg-crimson/12 blur-[140px]" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 py-24 lg:py-28">
        {/* heading */}
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <Reveal>
            <p className="mb-6 flex items-center gap-3 text-[11px] font-semibold tracking-[0.4em] uppercase text-crimson-bright">
              <svg viewBox="0 0 100 130" className="h-4.5 w-3.5 fill-crimson-bright">
                <path d={LEAF} />
              </svg>
              Order online
              <span className="h-px w-14 bg-crimson-bright" />
            </p>
            <h2 className="font-display text-4xl font-extrabold leading-[1.06] sm:text-5xl lg:text-[3.5rem]">
              Hungry? We'll wok it, box it,{" "}
              <em className="text-crimson-bright">and bring it.</em>
            </h2>
            <p className="mt-5 max-w-xl text-base font-light leading-relaxed text-cream/65">
              The full ARJU kitchen for pickup and delivery — stone-baked pizza,
              slow-layered biryani, wok-tossed Hakka, fresh shawarma and momos,
              made the moment you order.
            </p>
          </Reveal>

          <Reveal delay={140} className="grid gap-3 sm:grid-cols-3 lg:justify-end">
            {INFO_CHIPS.map((chip) => (
              <div
                key={chip.title}
                className="flex items-center gap-3.5 border border-cream/12 bg-ink/60 px-4 py-4"
              >
                <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0 fill-crimson-bright">
                  <path d={chip.icon} />
                </svg>
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.24em] uppercase text-cream/50">
                    {chip.title}
                  </p>
                  <p className="mt-0.5 text-xs font-medium leading-tight text-cream/90">
                    {chip.detail}
                  </p>
                </div>
              </div>
            ))}
          </Reveal>
        </div>

        {/* tabs */}
        <Reveal delay={100}>
          <div className="mt-12 flex flex-wrap gap-2.5 border-b border-cream/10">
            {ORDER_CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setTab(c.id)}
                className={cn(
                  "relative px-3.5 py-3 text-[10px] font-semibold tracking-[0.16em] uppercase transition-colors duration-300 sm:px-6 sm:text-[11px]",
                  tab === c.id ? "text-crimson-bright" : "text-cream/55 hover:text-cream",
                )}
              >
                {c.label}
                <span
                  className={cn(
                    "absolute inset-x-3 -bottom-px h-0.5 bg-crimson-bright transition-transform duration-300",
                    tab === c.id ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </button>
            ))}
          </div>
        </Reveal>

        {/* category blurb + spice bar */}
        <div key={`blurb-${current.id}`} className="fade-swap mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-light italic text-cream/55">{current.blurb}</p>
          {SPICE_CATEGORIES.has(current.id) && (
            <p className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] uppercase text-crimson-bright">
              <svg viewBox="0 0 100 130" className="h-3.5 w-2.5 fill-crimson-bright">
                <path d={LEAF} />
              </svg>
              Mild · Medium · Spicy · Extra Spicy — tell us in order notes
            </p>
          )}
        </div>

        {/* items */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {current.items.map((item, i) => (
            <ItemCard key={item.id} item={item} category={current.label} index={i} />
          ))}
        </div>

        {/* footer cross-links */}
        <Reveal>
          <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-cream/10 pt-8 sm:flex-row">
            <p className="flex items-center gap-3 text-xs font-light text-cream/50">
              <svg viewBox="0 0 100 130" className="h-4 w-3 fill-crimson-bright">
                <path d={LEAF} />
              </svg>
              Prefer the full dine-in experience?{" "}
              <a href="#visit" className="font-medium text-cream underline decoration-crimson decoration-2 underline-offset-4 hover:text-crimson-bright">
                Book a table
              </a>
            </p>
            <a
              href="#menu"
              className="text-[11px] font-semibold tracking-[0.26em] uppercase text-cream/70 transition-colors hover:text-crimson-bright"
            >
              View the full dine-in menu →
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
