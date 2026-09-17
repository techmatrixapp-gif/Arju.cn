import { useEffect, useRef, useState, type FormEvent } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { cn } from "../utils/cn";
import Reveal from "./Reveal";
import { LEAF } from "./Logo";
import { useApprovedReviews } from "../services/firestoreData";
import { Loader2, Star, CheckCircle2 } from "lucide-react";

function Stars({ count, className = "h-4 w-4" }: { count: number; className?: string }) {
  return (
    <span className="flex gap-1" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className={cn(className, i < count ? "fill-crimson" : "fill-ink/20")}
        >
          <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z" />
        </svg>
      ))}
    </span>
  );
}

export default function Testimonials() {
  const { reviews } = useApprovedReviews();
  const [idx, setIdx] = useState(0);
  const timer = useRef<number | null>(null);

  // Review submission state
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(5);
  const [error, setError] = useState<string | null>(null);

  const start = () => {
    stop();
    if (reviews.length === 0) return;
    timer.current = window.setInterval(
      () => setIdx((i) => (i + 1) % reviews.length),
      6000,
    );
  };
  const stop = () => {
    if (timer.current) window.clearInterval(timer.current);
  };

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    start();
    return stop;
  }, [reviews.length]);

  const featured = reviews[idx] || reviews[0] || {
    name: "Guest",
    rating: 5,
    text: "Remarkable experience at ARJU.",
    dish: "Biryani & Hakka",
  };

  const initials = featured.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleReviewSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const authorName = String(fd.get("name") || "").trim();
    const dish = String(fd.get("dish") || "").trim();
    const text = String(fd.get("text") || "").trim();

    try {
      await addDoc(collection(db, "reviews"), {
        name: authorName,
        authorName,
        stars: rating,
        rating,
        text,
        dish,
        approved: false, // requires admin approval in Admin Panel
        createdAt: new Date().toISOString(),
      });
      setSubmitted(true);
      setShowForm(false);
    } catch (err: any) {
      console.error("Review submit error:", err);
      setError("Unable to submit review right now.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="paper relative bg-cream text-ink overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 py-24 lg:py-32">
        <Reveal className="text-center">
          <div className="flex justify-center">
            <p className="mb-6 flex items-center gap-3 text-[11px] font-semibold tracking-[0.4em] uppercase text-crimson">
              <svg viewBox="0 0 100 130" className="h-4.5 w-3.5 fill-crimson">
                <path d={LEAF} />
              </svg>
              Best in the city, that's what people say
              <span className="h-px w-14 bg-crimson" />
            </p>
          </div>
          <h2 className="font-display text-4xl font-extrabold leading-tight sm:text-5xl">
            800+ five-star nights, <em className="text-crimson">and counting.</em>
          </h2>
          <div className="mt-6 inline-flex items-center gap-3 border-2 border-ink/10 bg-white/40 px-5 py-2.5">
            <span className="font-display text-2xl font-extrabold text-crimson">4.9</span>
            <Stars count={5} />
            <span className="text-xs font-medium tracking-[0.16em] uppercase text-ink/55">
              on Google · Verified diner reviews
            </span>
          </div>
        </Reveal>

        {/* rotating featured review */}
        <Reveal delay={120}>
          <div
            className="relative mt-14 bg-ink px-7 py-12 text-cream sm:px-14 sm:py-16"
            onMouseEnter={stop}
            onMouseLeave={start}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute left-6 top-4 select-none font-display text-[7rem] leading-none text-crimson/25"
            >
              “
            </span>
            <div key={featured.id || idx} className="fade-swap relative">
              <p className="max-w-3xl font-display text-xl font-medium italic leading-relaxed text-cream/90 sm:text-2xl lg:text-[1.7rem]">
                {featured.text}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-crimson font-display text-base font-bold">
                  {initials}
                </span>
                <div>
                  <p className="font-display text-base font-bold text-cream">
                    {featured.name || featured.authorName}
                  </p>
                  <p className="text-xs text-stone">
                    Ordered: <strong className="text-cream">{featured.dish}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* dots */}
            <div className="mt-10 flex gap-2">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  aria-label={`Show review ${i + 1}`}
                  className={cn(
                    "h-1.5 transition-all duration-300 cursor-pointer",
                    i === idx ? "w-8 bg-crimson-bright" : "w-3 bg-cream/20 hover:bg-cream/40",
                  )}
                />
              ))}
            </div>
          </div>
        </Reveal>

        {/* Customer review action */}
        <div className="mt-12 text-center">
          {submitted && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-xs rounded-full mb-4">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Thank you for sharing your experience! Your review is pending approval.
            </div>
          )}

          {!showForm && !submitted && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 border border-ink/20 px-6 py-2.5 text-xs font-semibold tracking-wider uppercase text-ink hover:border-crimson hover:text-crimson transition cursor-pointer"
            >
              <Star className="w-3.5 h-3.5" />
              Leave a Review
            </button>
          )}

          {showForm && (
            <div className="max-w-lg mx-auto mt-6 bg-white/80 backdrop-blur border border-ink/10 p-6 rounded-lg text-left shadow-sm">
              <h3 className="font-display text-lg font-bold text-ink mb-1">
                Share your ARJU experience
              </h3>
              <p className="text-xs text-ink/60 mb-4">
                Reviews are moderated and verified by our team.
              </p>

              {error && <p className="text-xs text-crimson mb-3">{error}</p>}

              <form onSubmit={handleReviewSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-ink/70 font-semibold mb-1">
                    Your Name
                  </label>
                  <input
                    name="name"
                    required
                    placeholder="e.g. Maya L."
                    className="w-full border border-ink/20 px-3 py-2 text-xs rounded bg-white text-ink outline-none focus:border-crimson"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-ink/70 font-semibold mb-1">
                      Rating
                    </label>
                    <select
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="w-full border border-ink/20 px-3 py-2 text-xs rounded bg-white text-ink outline-none focus:border-crimson"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                      <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                      <option value={3}>⭐⭐⭐ (3 Stars)</option>
                      <option value={2}>⭐⭐ (2 Stars)</option>
                      <option value={1}>⭐ (1 Star)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-ink/70 font-semibold mb-1">
                      Favourite Dish
                    </label>
                    <input
                      name="dish"
                      placeholder="e.g. Chilli Chicken Hakka"
                      className="w-full border border-ink/20 px-3 py-2 text-xs rounded bg-white text-ink outline-none focus:border-crimson"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-ink/70 font-semibold mb-1">
                    Your Thoughts
                  </label>
                  <textarea
                    name="text"
                    required
                    rows={3}
                    placeholder="Tell us what you loved about your meal or visit..."
                    className="w-full border border-ink/20 px-3 py-2 text-xs rounded bg-white text-ink outline-none focus:border-crimson"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-xs text-ink/60 hover:text-ink cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-crimson hover:bg-crimson-bright text-cream text-xs font-semibold px-5 py-2 rounded transition cursor-pointer"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Review"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
