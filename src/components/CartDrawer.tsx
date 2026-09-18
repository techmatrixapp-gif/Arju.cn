import { useMemo, useState, type FormEvent } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { cn } from "../utils/cn";
import { LEAF } from "./Logo";
import { useCart, type CartLine } from "../context/CartContext";
import { ADDRESS, PHONE, ORDER_FEES } from "../data/content";
import { saveLocalOrder } from "../services/localOrdersStore";
import type { Order } from "../types/firestore";

const cad = (n: number) => `$${n.toFixed(2)}`;

type Step = "cart" | "details" | "payment" | "done";
type Fulfillment = "delivery" | "pickup";
type PayMethod = "card" | "cash";

interface Confirmation {
  orderNo: string;
  fulfillment: Fulfillment;
  name: string;
  phone: string;
  address?: string;
  when: string;
  eta: string;
  items: CartLine[];
  count: number;
  subtotal: number;
  fee: number;
  tax: number;
  total: number;
  pay: PayMethod;
}

/* ---------------- icons ---------------- */

const BagIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M6 8h12l-1 12.5H7L6 8Z" strokeLinejoin="round" />
    <path d="M9 8V6.5a3 3 0 0 1 6 0V8" strokeLinecap="round" />
  </svg>
);

const Minus = ({ className = "h-3 w-3" }) => (
  <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 8h10" strokeLinecap="round" />
  </svg>
);
const Plus = ({ className = "h-3 w-3" }) => (
  <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M8 3v10M3 8h10" strokeLinecap="round" />
  </svg>
);

/* ---------------- line stepper ---------------- */

function LineStepper({ line }: { line: CartLine }) {
  const { setQty } = useCart();
  return (
    <div className="flex items-center gap-1 border border-ink/15 bg-white p-0.5">
      <button
        onClick={() => setQty(line.id, line.qty - 1)}
        aria-label={`Remove one ${line.name}`}
        className="flex h-7 w-7 items-center justify-center text-ink/70 transition-colors hover:bg-ink/5"
      >
        <Minus />
      </button>
      <span className="w-6 text-center text-sm font-semibold tabular-nums">{line.qty}</span>
      <button
        onClick={() => setQty(line.id, line.qty + 1)}
        aria-label={`Add one ${line.name}`}
        className="flex h-7 w-7 items-center justify-center text-ink/70 transition-colors hover:bg-ink/5"
      >
        <Plus />
      </button>
    </div>
  );
}

/* ---------------- totals ---------------- */

function Totals({
  subtotal,
  fee,
  tax,
  total,
  feeLabel,
}: {
  subtotal: number;
  fee: number;
  tax: number;
  total: number;
  feeLabel: string;
}) {
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between text-ink/70">
        <dt>Subtotal</dt>
        <dd className="tabular-nums">{cad(subtotal)}</dd>
      </div>
      <div className="flex justify-between text-ink/70">
        <dt>{feeLabel}</dt>
        <dd className="tabular-nums">{fee === 0 ? <span className="font-semibold text-crimson">FREE</span> : cad(fee)}</dd>
      </div>
      <div className="flex justify-between text-ink/70">
        <dt>HST (13%)</dt>
        <dd className="tabular-nums">{cad(tax)}</dd>
      </div>
      <div className="flex justify-between border-t border-ink/15 pt-2.5 font-display text-lg font-bold text-ink">
        <dt>Total</dt>
        <dd className="tabular-nums">{cad(total)}</dd>
      </div>
    </dl>
  );
}

const inputCls =
  "w-full border border-ink/20 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/35 outline-none transition-colors focus:border-crimson";
const labelCls = "mb-1.5 block text-[10px] font-semibold tracking-[0.22em] uppercase text-ink/55";

/* ---------------- drawer ---------------- */

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, clear, subtotal, count } = useCart();
  const [step, setStep] = useState<Step>("cart");
  const [fulfillment, setFulfillment] = useState<Fulfillment>("delivery");
  const [when, setWhen] = useState("ASAP");
  const [pay, setPay] = useState<PayMethod>("card");
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    street: "",
    unit: "",
    postal: "",
    notes: "",
    card: "",
    exp: "",
    cvc: "",
  });
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const fee = useMemo(() => {
    if (fulfillment !== "delivery" || subtotal === 0) return 0;
    return subtotal >= ORDER_FEES.FREE_DELIVERY_OVER ? 0 : ORDER_FEES.DELIVERY_FEE;
  }, [fulfillment, subtotal]);
  const tax = (subtotal + fee) * ORDER_FEES.TAX_RATE;
  const total = subtotal + fee + tax;
  const empty = items.length === 0;

  const resetAll = () => {
    clear();
    setConfirmation(null);
    setStep("cart");
  };

  const placeOrder = async (e: FormEvent) => {
    e.preventDefault();
    const eta =
      when !== "ASAP"
        ? when
        : fulfillment === "pickup"
          ? "Ready in 20–25 minutes"
          : "Arrives in 35–50 minutes";
    const orderNo = `ARJU-${Math.floor(1000 + Math.random() * 9000)}`;

    const deliveryAddress =
      fulfillment === "delivery"
        ? [form.street, form.unit && `Unit ${form.unit}`, `Toronto, ON ${form.postal}`]
            .filter(Boolean)
            .join(", ")
        : undefined;

    const orderId = `ord-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const newOrder: Order & { [key: string]: any } = {
      id: orderId,
      orderNo,
      customer: {
        name: form.name,
        email: form.email || "",
        phone: form.phone,
        street: form.street || "",
        unit: form.unit || "",
        address: deliveryAddress || "",
        postalCode: form.postal || "",
        notes: form.notes || "",
      },
      customerName: form.name,
      customerEmail: form.email || "",
      customerPhone: form.phone,
      items: items.map((l) => ({
        itemId: l.id,
        name: l.name,
        price: l.price,
        quantity: l.qty,
        qty: l.qty,
        variant: (l as any).variant || "",
        notes: "",
      })),
      subtotal,
      tax,
      deliveryFee: fee,
      total,
      type: fulfillment,
      orderType: fulfillment,
      orderStatus: "new",
      status: "new",
      paymentStatus: pay === "card" ? "paid" : "pending",
      paymentMethod: pay,
      deliveryAddress: deliveryAddress || null,
      notes: form.notes || "",
      createdAt: new Date().toISOString(),
    };

    // 1. Immediately save to reliable local store so admin always receives it in real time
    saveLocalOrder(newOrder);

    // 2. Persist to Firestore database
    try {
      const docRef = await addDoc(collection(db, "orders"), newOrder);
      if (docRef?.id) {
        newOrder.id = docRef.id;
        saveLocalOrder(newOrder);
      }
    } catch (err) {
      console.warn("Could not write order to Firestore (saved locally):", err);
    }

    setConfirmation({
      orderNo,
      fulfillment,
      name: form.name,
      phone: form.phone,
      address: deliveryAddress,
      when,
      eta,
      items,
      count,
      subtotal,
      fee,
      tax,
      total,
      pay,
    });
    clear();
    setStep("done");
  };

  const formatCard = (raw: string) =>
    raw
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  const formatExp = (raw: string) => {
    const d = raw.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const progress = Math.min(100, (subtotal / ORDER_FEES.FREE_DELIVERY_OVER) * 100);
  const amountToFree = ORDER_FEES.FREE_DELIVERY_OVER - subtotal;

  const stepIndex = step === "cart" ? 1 : step === "details" ? 2 : 3;

  return (
    <div
      className={cn("fixed inset-0 z-50", isOpen ? "" : "pointer-events-none")}
      aria-hidden={!isOpen}
      inert={!isOpen}
    >
      {/* overlay */}
      <div
        onClick={closeCart}
        className={cn(
          "absolute inset-0 bg-ink/75 backdrop-blur-sm transition-opacity duration-400",
          isOpen ? "opacity-100" : "opacity-0",
        )}
      />

      {/* panel */}
      <aside
        role="dialog"
        aria-label="Your order"
        className={cn(
          "absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream text-ink shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* header */}
        <div className="flex items-center gap-3 bg-crimson px-5 py-4 text-cream">
          {step !== "cart" && step !== "done" ? (
            <button
              onClick={() => setStep(step === "payment" ? "details" : "cart")}
              aria-label="Back"
              className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-ink/15"
            >
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M14 8H3M7.5 3.5 3 8l4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/15">
              <BagIcon className="h-4 w-4" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-bold leading-none">
              {step === "cart" && "Your order"}
              {step === "details" && "Pickup or delivery"}
              {step === "payment" && "Payment"}
              {step === "done" && "Order confirmed"}
            </p>
            {step !== "done" && (
              <p className="mt-1 text-[10px] font-medium tracking-[0.24em] uppercase text-cream/70">
                Step {stepIndex} of 3
              </p>
            )}
          </div>
          <button
            onClick={closeCart}
            aria-label="Close order"
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-ink/15"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 4l12 12M16 4L4 16" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto">
          {step === "done" && confirmation ? (
            <ConfirmationView c={confirmation} onNewOrder={() => { resetAll(); }} onClose={closeCart} />
          ) : empty ? (
            <div className="flex h-full flex-col items-center justify-center px-8 text-center">
              <span className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-ink/20">
                <BagIcon className="h-9 w-9 text-ink/30" />
              </span>
              <h3 className="mt-6 font-display text-2xl font-bold">Your order is empty</h3>
              <p className="mt-2 text-sm font-light leading-relaxed text-ink/60">
                Add a chilli chicken, biryani or a wrap — it'll show up here.
              </p>
              <a
                href="#order"
                onClick={closeCart}
                className="mt-7 inline-flex items-center gap-2 bg-ink px-7 py-3.5 text-[11px] font-semibold tracking-[0.26em] uppercase text-cream transition-colors hover:bg-crimson"
              >
                Start your order
              </a>
            </div>
          ) : step === "cart" ? (
            <div className="px-5 py-5">
              {/* fulfillment quick toggle */}
              <div className="mb-4 grid grid-cols-2 gap-2">
                {(["pickup", "delivery"] as Fulfillment[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFulfillment(f)}
                    className={cn(
                      "border px-3 py-2.5 text-[11px] font-semibold tracking-[0.18em] uppercase transition-all",
                      fulfillment === f
                        ? "border-ink bg-ink text-cream"
                        : "border-ink/20 text-ink/60 hover:border-ink/50",
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {fulfillment === "delivery" && (
                <div className="mb-5 border border-ink/10 bg-white/60 px-4 py-3">
                  <p className="text-xs font-medium text-ink/75">
                    {amountToFree > 0 ? (
                      <>
                        Add{" "}
                        <span className="font-bold text-crimson">{cad(amountToFree)}</span>{" "}
                        more for <span className="font-semibold">free delivery</span>
                      </>
                    ) : (
                      <span className="font-semibold text-crimson">🎉 You've unlocked free delivery</span>
                    )}
                  </p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
                    <div
                      className="h-full rounded-full bg-crimson transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <ul className="space-y-4">
                {items.map((line) => (
                  <li key={line.id} className="flex gap-3.5 border-b border-ink/10 pb-4">
                    <img src={line.img} alt="" className="h-16 w-16 shrink-0 object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold leading-snug">{line.name}</p>
                          <p className="mt-0.5 text-[10px] font-medium tracking-[0.18em] uppercase text-ink/40">
                            {line.category}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-bold tabular-nums">
                          {cad(line.price * line.qty)}
                        </p>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between">
                        <LineStepper line={line} />
                        <button
                          onClick={() => removeItem(line.id)}
                          className="text-[10px] font-semibold tracking-[0.2em] uppercase text-ink/40 underline-offset-2 transition-colors hover:text-crimson hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <button
                onClick={clear}
                className="mt-4 text-[10px] font-semibold tracking-[0.24em] uppercase text-ink/40 underline-offset-2 transition-colors hover:text-crimson hover:underline"
              >
                Clear order
              </button>
            </div>
          ) : step === "details" ? (
            <form id="details-form" className="px-5 py-6" onSubmit={(e) => { e.preventDefault(); setStep("payment"); }}>
              <div className="mb-5 grid grid-cols-2 gap-2.5">
                {([
                  { id: "pickup", title: "Pickup", eta: "20–25 min", icon: "M8 2a6 6 0 0 0-6 6c0 4.5 6 10 6 10s6-5.5 6-10a6 6 0 0 0-6-6Z" },
                  { id: "delivery", title: "Delivery", eta: "35–50 min", icon: "M3 6h11v8H3zM14 9h2.5l-2 3H14z" },
                ] as const).map((opt) => (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => setFulfillment(opt.id)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 border-2 px-3 py-4 text-center transition-all",
                      fulfillment === opt.id
                        ? "border-crimson bg-crimson/5"
                        : "border-ink/15 hover:border-ink/40",
                    )}
                  >
                    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-crimson">
                      <path d={opt.icon} />
                    </svg>
                    <span className="text-xs font-bold tracking-[0.18em] uppercase">{opt.title}</span>
                    <span className="text-[10px] font-light text-ink/55">{opt.eta}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className={labelCls} htmlFor="ord-name">Full name *</label>
                  <input id="ord-name" required value={form.name} onChange={set("name")} placeholder="Jordan MacLeod" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="ord-phone">Mobile number *</label>
                  <input id="ord-phone" type="tel" required value={form.phone} onChange={set("phone")} placeholder="(647) 531-4715" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="ord-email">Email address</label>
                  <input id="ord-email" type="email" value={form.email} onChange={set("email")} placeholder="info@arju.ca" className={inputCls} />
                </div>

                {fulfillment === "delivery" ? (
                  <>
                    <div>
                      <label className={labelCls} htmlFor="ord-street">Street address *</label>
                      <input id="ord-street" required value={form.street} onChange={set("street")} placeholder="429 Yonge St #102" className={inputCls} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls} htmlFor="ord-unit">Apt / Unit</label>
                        <input id="ord-unit" value={form.unit} onChange={set("unit")} placeholder="102" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls} htmlFor="ord-postal">Postal code *</label>
                        <input id="ord-postal" required value={form.postal} onChange={set("postal")} placeholder="M5B 1T1" className={inputCls} />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="border border-ink/10 bg-white/60 px-4 py-3 text-xs font-light leading-relaxed text-ink/65">
                    Pickup from <span className="font-semibold text-ink">{ADDRESS}</span>. We'll
                    text you when it's on the pass.
                  </div>
                )}

                <div>
                  <label className={labelCls} htmlFor="ord-when">
                    {fulfillment === "delivery" ? "Deliver" : "Ready"} time
                  </label>
                  <select id="ord-when" value={when} onChange={(e) => setWhen(e.target.value)} className={inputCls}>
                    <option>ASAP</option>
                    {["5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM"].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls} htmlFor="ord-notes">Order notes</label>
                  <textarea
                    id="ord-notes"
                    rows={2}
                    value={form.notes}
                    onChange={set("notes")}
                    placeholder="Allergies, buzzer code, extra napkins…"
                    className={cn(inputCls, "resize-none")}
                  />
                </div>
              </div>
            </form>
          ) : (
            <form id="payment-form" className="px-5 py-6" onSubmit={placeOrder}>
              {/* mini summary */}
              <div className="mb-5 border border-ink/10 bg-white/60 p-4 text-xs">
                <div className="flex justify-between">
                  <span className="font-semibold tracking-[0.16em] uppercase text-ink/55">
                    {fulfillment} · {when}
                  </span>
                  <span className="font-semibold">{count} items</span>
                </div>
                <p className="mt-1.5 truncate font-light text-ink/65">
                  {fulfillment === "delivery"
                    ? [form.street, form.unit && `Unit ${form.unit}`, form.postal].filter(Boolean).join(", ")
                    : `Pickup — ${ADDRESS}`}
                </p>
              </div>

              <p className={labelCls}>Payment method</p>
              <div className="space-y-2.5">
                <label
                  className={cn(
                    "flex cursor-pointer items-center gap-3 border-2 px-4 py-3.5 transition-all",
                    pay === "card" ? "border-crimson bg-crimson/5" : "border-ink/15 hover:border-ink/40",
                  )}
                >
                  <input type="radio" name="pay" className="accent-crimson" checked={pay === "card"} onChange={() => setPay("card")} />
                  <span className="flex-1 text-sm font-semibold">Credit / Debit card</span>
                  <span className="text-base tracking-tight">💳</span>
                </label>
                <label
                  className={cn(
                    "flex cursor-pointer items-center gap-3 border-2 px-4 py-3.5 transition-all",
                    pay === "cash" ? "border-crimson bg-crimson/5" : "border-ink/15 hover:border-ink/40",
                  )}
                >
                  <input type="radio" name="pay" className="accent-crimson" checked={pay === "cash"} onChange={() => setPay("cash")} />
                  <span className="flex-1 text-sm font-semibold">
                    {fulfillment === "delivery" ? "Cash on delivery" : "Pay on pickup"}
                  </span>
                  <span className="text-base">💵</span>
                </label>
              </div>

              {pay === "card" && (
                <div className="fade-swap mt-4 space-y-3.5">
                  <div>
                    <label className={labelCls} htmlFor="ord-card">Card number *</label>
                    <input
                      id="ord-card"
                      inputMode="numeric"
                      required
                      value={form.card}
                      onChange={(e) => setForm((f) => ({ ...f, card: formatCard(e.target.value) }))}
                      placeholder="4242 4242 4242 4242"
                      className={inputCls}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls} htmlFor="ord-exp">Expiry *</label>
                      <input
                        id="ord-exp"
                        inputMode="numeric"
                        required
                        value={form.exp}
                        onChange={(e) => setForm((f) => ({ ...f, exp: formatExp(e.target.value) }))}
                        placeholder="MM/YY"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls} htmlFor="ord-cvc">CVC *</label>
                      <input
                        id="ord-cvc"
                        inputMode="numeric"
                        required
                        maxLength={4}
                        value={form.cvc}
                        onChange={(e) => setForm((f) => ({ ...f, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                        placeholder="123"
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-5">
                <Totals
                  subtotal={subtotal}
                  fee={fee}
                  tax={tax}
                  total={total}
                  feeLabel={fulfillment === "delivery" ? "Delivery" : "Pickup"}
                />
              </div>

              <p className="mt-4 flex items-start gap-2 text-[10px] font-light leading-relaxed text-ink/45">
                <svg viewBox="0 0 100 130" className="mt-0.5 h-3.5 w-2.5 shrink-0 fill-crimson">
                  <path d={LEAF} />
                </svg>
                Demo checkout — no real payment is processed and no real order is placed.
              </p>
            </form>
          )}
        </div>

        {/* footer CTA */}
        {step !== "done" && !empty && (
          <div className="border-t border-ink/15 bg-cream px-5 py-4">
            {step === "cart" && (
              <div className="mb-3">
                <Totals
                  subtotal={subtotal}
                  fee={fee}
                  tax={tax}
                  total={total}
                  feeLabel={fulfillment === "delivery" ? "Delivery" : "Pickup"}
                />
              </div>
            )}
            {step === "cart" && (
              <button
                onClick={() => setStep("details")}
                className="group flex w-full items-center justify-center gap-3 bg-crimson px-6 py-4 text-[11px] font-semibold tracking-[0.28em] uppercase text-cream transition-colors hover:bg-crimson-bright"
              >
                Checkout · {cad(total)}
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M2 8h11M9 3.5 13.5 8 9 12.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            {step === "details" && (
              <button
                type="submit"
                form="details-form"
                className="w-full bg-ink px-6 py-4 text-[11px] font-semibold tracking-[0.28em] uppercase text-cream transition-colors hover:bg-crimson"
              >
                Continue to payment
              </button>
            )}
            {step === "payment" && (
              <button
                type="submit"
                form="payment-form"
                className="w-full bg-crimson px-6 py-4 text-[11px] font-semibold tracking-[0.28em] uppercase text-cream transition-colors hover:bg-crimson-bright"
              >
                Place order · {cad(total)}
              </button>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}

/* ---------------- confirmation ---------------- */

function ConfirmationView({
  c,
  onNewOrder,
  onClose,
}: {
  c: Confirmation;
  onNewOrder: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fade-swap px-6 py-10 text-center">
      <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-crimson text-cream">
        <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="2.6">
          <path d="M4.5 12.5l5 5 10-11" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <h3 className="mt-6 font-display text-3xl font-extrabold leading-tight">
        Thanks, {c.name.split(" ")[0] || "friend"}!
      </h3>
      <p className="mt-2 text-sm font-light leading-relaxed text-ink/65">
        Your order is in with the kitchen. We'll text{" "}
        <span className="font-semibold text-ink">{c.phone || "your number"}</span> the moment
        it's ready.
      </p>

      <div className="mx-auto mt-7 max-w-xs border-2 border-ink/10 bg-white/60 px-6 py-5">
        <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-ink/45">
          Order number
        </p>
        <p className="mt-1 font-display text-3xl font-black text-crimson">{c.orderNo}</p>
        <p className="mt-3 text-sm font-semibold">{c.eta}</p>
        <p className="mt-1 text-[11px] font-light text-ink/55">
          {c.fulfillment === "pickup" ? `Pickup at ${ADDRESS}` : c.address}
        </p>
      </div>

      <div className="mx-auto mt-5 max-w-xs text-left text-sm">
        <Totals
          subtotal={c.subtotal}
          fee={c.fee}
          tax={c.tax}
          total={c.total}
          feeLabel={c.fulfillment === "delivery" ? "Delivery" : "Pickup"}
        />
        <p className="mt-3 border-t border-ink/10 pt-3 text-[11px] font-light text-ink/50">
          Paying by{" "}
          {c.pay === "card"
            ? "card"
            : c.fulfillment === "delivery"
              ? "cash on delivery"
              : "cash on pickup"}
          .
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <button
          onClick={onNewOrder}
          className="w-full bg-ink px-6 py-4 text-[11px] font-semibold tracking-[0.28em] uppercase text-cream transition-colors hover:bg-crimson"
        >
          Start a new order
        </button>
        <a
          href="#visit"
          onClick={onClose}
          className="text-[11px] font-semibold tracking-[0.24em] uppercase text-ink/60 underline-offset-4 transition-colors hover:text-crimson hover:underline"
        >
          Or book a table instead
        </a>
      </div>
      <p className="mt-6 text-[10px] font-light text-ink/35">
        Questions about your order? Call {PHONE}
      </p>
    </div>
  );
}

/* ---------------- mobile floating bar ---------------- */

export function FloatingOrderBar() {
  const { count, subtotal, isOpen, openCart } = useCart();
  if (count === 0 || isOpen) return null;
  return (
    <>
      {/* spacer so the fixed bar never covers footer content */}
      <div aria-hidden className="h-24 md:hidden" />
      <div className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
      <button
        onClick={openCart}
        className="fade-swap flex w-full items-center justify-between gap-3 bg-crimson px-5 py-3.5 text-cream shadow-[0_-4px_30px_rgba(0,0,0,0.35)]"
      >
        <span className="flex items-center gap-3">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-ink/25">
            <BagIcon className="h-4 w-4" />
            <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-bold">
              {count}
            </span>
          </span>
          <span className="text-[11px] font-semibold tracking-[0.24em] uppercase">
            View order
          </span>
        </span>
        <span className="font-display text-lg font-bold tabular-nums">{cad(subtotal)}</span>
      </button>
      </div>
    </>
  );
}
