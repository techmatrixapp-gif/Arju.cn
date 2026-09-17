import { LEAF } from "./Logo";

const WORDS = [
  "Dum Biryani",
  "Chilli Chicken",
  "Hakka Noodles",
  "Chicken 65",
  "Shawarma Wraps",
  "Momos",
  "Stone-Baked Pizza",
  "Manchurian",
  "Schezwan",
  "Fresh Falafel",
  "Delivery & Pickup",
];

function Strip() {
  return (
    <div className="flex shrink-0 items-center">
      {WORDS.map((w) => (
        <span key={w} className="flex items-center">
          <span className="whitespace-nowrap px-6 font-display text-lg sm:text-xl italic font-medium text-cream">
            {w}
          </span>
          <svg viewBox="0 0 100 130" className="h-4 w-3 fill-ink/70">
            <path d={LEAF} />
          </svg>
        </span>
      ))}
    </div>
  );
}

export default function Marquee() {
  return (
    <div className="relative z-10 overflow-hidden border-y border-crimson-deep bg-crimson py-3.5 shadow-[0_10px_50px_rgba(126,11,26,0.4)]">
      <div className="marquee-track flex w-max">
        <Strip />
        <Strip />
      </div>
    </div>
  );
}
