import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import Reveal from "../components/Reveal";
import { useCategories, useMenuItems } from "../services/firestoreData";
import { useCart } from "../context/CartContext";
import OrderSection from "../components/OrderSection";
import { Search, Flame, Sparkles, Check, Plus, ShoppingBag } from "lucide-react";

export default function MenuPage() {
  const { categories } = useCategories();
  const { items, loading: loadingItems } = useMenuItems();
  const { addItem, openCart } = useCart();

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Menu — Handcrafted Halal Kitchen & Grill | ARJU Toronto";
  }, []);

  // Filtered categories
  const visibleCategories = useMemo(() => {
    return categories.filter((c) => c.visible !== false);
  }, [categories]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (item.available === false) return false;
      if (activeCategory !== "all" && item.categoryId !== activeCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchDesc = (item.description || "").toLowerCase().includes(q);
        const matchTags = (item.tags || []).some((t) => t.toLowerCase().includes(q));
        if (!matchName && !matchDesc && !matchTags) return false;
      }
      return true;
    });
  }, [items, activeCategory, searchQuery]);

  // Signatures / Popular items
  const signatureItems = useMemo(() => {
    return items.filter((i) => i.popular && i.available !== false).slice(0, 4);
  }, [items]);

  const handleQuickAdd = (item: any) => {
    const firstVariant = item.variants?.[0];
    addItem({
      id: item.id,
      name: firstVariant ? `${item.name} (${firstVariant.label})` : item.name,
      price: firstVariant ? firstVariant.price : item.price,
      img: item.imageUrl || "",
      category: item.categoryId || "all",
    });
    setJustAddedId(item.id);
    setTimeout(() => setJustAddedId(null), 1800);
  };

  return (
    <div className="pt-28 pb-20 bg-ink text-cream">
      {/* Page Header */}
      <section className="relative px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto text-center border-b border-white/10 pb-16">
        <Reveal>
          <div className="flex items-center justify-center gap-3 text-crimson-bright mb-3">
            <span className="h-px w-8 bg-crimson" />
            <span className="text-[11px] tracking-[0.35em] uppercase font-semibold">
              Downtown Toronto · 429 Yonge St
            </span>
            <span className="h-px w-8 bg-crimson" />
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-cream">
            The ARJU Menu
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-stone text-sm sm:text-base leading-relaxed">
            Every dish is cooked from scratch with 100% certified Halal meats, freshly roasted
            spices, and heritage techniques—from 48-hour fermented pizza dough to charcoal-grilled
            shawarma.
          </p>
        </Reveal>

        {/* Dietary & Halal badge strip */}
        <Reveal delay={150}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-[11px] font-medium tracking-wider uppercase">
            <span className="border border-cream/20 bg-white/5 px-3.5 py-1.5 text-cream/90 flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-crimson-bright" /> 100% Halal Certified
            </span>
            <span className="border border-cream/20 bg-white/5 px-3.5 py-1.5 text-cream/90 flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-amber-400" /> Made to Order
            </span>
            <span className="border border-cream/20 bg-white/5 px-3.5 py-1.5 text-cream/90 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" /> Vegetarian & Vegan Options
            </span>
          </div>
        </Reveal>
      </section>

      {/* House Signatures Strip */}
      {signatureItems.length > 0 && (
        <section className="px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto py-16 border-b border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-[10px] tracking-[0.3em] font-semibold text-crimson-bright uppercase block">
                House Favourites
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-cream mt-1">
                Chef's Signatures
              </h2>
            </div>
            <a
              href="#order-online"
              className="text-xs font-semibold tracking-widest uppercase text-stone hover:text-cream transition-colors underline underline-offset-4"
            >
              Order for Pickup or Delivery ↓
            </a>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {signatureItems.map((item) => (
              <div
                key={item.id}
                className="group border border-white/10 bg-coal/70 p-4 flex flex-col justify-between hover:border-crimson/50 transition-all duration-300"
              >
                <div>
                  {item.imageUrl && (
                    <div className="relative h-44 w-full overflow-hidden bg-ink/60 mb-4">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute top-2 left-2 bg-crimson px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase text-cream">
                        Popular
                      </span>
                    </div>
                  )}
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-display text-base font-bold text-cream group-hover:text-crimson-bright transition-colors">
                      {item.name}
                    </h3>
                    <span className="font-semibold text-sm tabular-nums text-cream/90">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-stone line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-stone">
                    {item.tags?.[0] || "Signature"}
                  </span>
                  <button
                    onClick={() => handleQuickAdd(item)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-crimson-bright hover:text-cream bg-crimson/10 hover:bg-crimson px-3 py-1.5 transition-colors cursor-pointer"
                  >
                    {justAddedId === item.id ? (
                      <>
                        <Check className="h-3 w-3" /> Added
                      </>
                    ) : (
                      <>
                        <Plus className="h-3 w-3" /> Add
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Interactive Category Menu & Search */}
      <section className="px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto py-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer border ${
                activeCategory === "all"
                  ? "border-crimson bg-crimson text-cream shadow-sm"
                  : "border-white/15 bg-white/5 text-stone hover:text-cream hover:border-white/30"
              }`}
            >
              All Items ({items.length})
            </button>
            {visibleCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer border ${
                  activeCategory === cat.id
                    ? "border-crimson bg-crimson text-cream shadow-sm"
                    : "border-white/15 bg-white/5 text-stone hover:text-cream hover:border-white/30"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes or ingredients..."
              className="w-full border border-white/15 bg-ink pl-10 pr-4 py-2.5 text-xs text-cream placeholder-stone/60 focus:border-crimson focus:outline-none"
            />
          </div>
        </div>

        {/* Loading State */}
        {loadingItems && (
          <div className="py-20 text-center">
            <div className="h-8 w-8 mx-auto animate-spin rounded-full border-2 border-crimson border-t-transparent mb-3" />
            <p className="text-xs tracking-widest uppercase text-stone">Loading Fresh Kitchen Menu...</p>
          </div>
        )}

        {/* Menu Items Grid */}
        {!loadingItems && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="border border-white/10 bg-coal/50 p-5 flex flex-col justify-between hover:border-white/25 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-base font-bold text-cream">{item.name}</h3>
                    <span className="font-semibold text-sm tabular-nums text-crimson-bright">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-stone leading-relaxed">
                    {item.description || "Freshly prepared with authentic herbs & spices."}
                  </p>

                  {/* Variants pill preview if any */}
                  {item.variants && item.variants.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {item.variants.map((v, i) => (
                        <span
                          key={i}
                          className="bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-stone"
                        >
                          {v.label}: ${v.price.toFixed(2)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {item.tags?.slice(0, 2).map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] uppercase tracking-wider text-stone/80 bg-ink px-2 py-0.5 border border-white/5"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => handleQuickAdd(item)}
                    className="inline-flex items-center gap-1.5 border border-crimson/50 hover:border-crimson bg-crimson/15 hover:bg-crimson px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-cream transition-all cursor-pointer"
                  >
                    {justAddedId === item.id ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" /> Added
                      </>
                    ) : (
                      <>
                        <Plus className="h-3 w-3" /> Add to Order
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredItems.length === 0 && !loadingItems && (
          <div className="border border-dashed border-white/15 p-12 text-center text-stone">
            <p className="text-sm text-cream font-medium">No dishes match your search.</p>
            <button
              onClick={() => {
                setActiveCategory("all");
                setSearchQuery("");
              }}
              className="mt-3 text-xs text-crimson-bright underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* Online Ordering Integrated Section */}
      <div id="order-online" className="border-t border-white/10">
        <OrderSection />
      </div>

      {/* Bottom CTA to Reserve a Table */}
      <section className="px-6 sm:px-10 lg:px-16 max-w-5xl mx-auto py-16 text-center border-t border-white/10">
        <span className="text-[10px] tracking-[0.35em] uppercase font-bold text-crimson-bright block mb-2">
          Dine With Us
        </span>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-cream">
          Prefer to Experience ARJU in Person?
        </h2>
        <p className="mt-3 text-sm text-stone max-w-xl mx-auto">
          Reserve your table online in under a minute with real-time availability and instant
          confirmation.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/booking"
            className="border border-cream/40 hover:border-cream bg-cream/10 hover:bg-cream text-cream hover:text-ink px-6 py-3 text-xs font-semibold tracking-[0.24em] uppercase transition-all duration-300"
          >
            Book a Table
          </Link>
          <button
            onClick={openCart}
            className="inline-flex items-center gap-2 bg-crimson hover:bg-crimson-bright text-cream px-6 py-3 text-xs font-semibold tracking-[0.24em] uppercase transition-all duration-300"
          >
            <ShoppingBag className="h-4 w-4" /> View Current Bag
          </button>
        </div>
      </section>
    </div>
  );
}
