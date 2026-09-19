import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { CartProvider, useCart } from "../context/CartContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { CartDrawer, FloatingOrderBar } from "../components/CartDrawer";
import { cn } from "../utils/cn";

function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Delay slightly for DOM elements to mount
      const timer = setTimeout(() => {
        const id = hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
      return () => clearTimeout(timer);
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [pathname, hash]);

  return null;
}

function BackToTop() {
  const [show, setShow] = useState(false);
  const { count } = useCart();

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      aria-label="Back to top"
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
        })
      }
      className={cn(
        "fixed right-5 z-40 flex h-12 w-12 items-center justify-center border border-crimson/60 bg-ink/90 text-cream backdrop-blur transition-all duration-500 hover:border-crimson hover:bg-crimson cursor-pointer",
        count > 0 ? "bottom-24 md:bottom-6" : "bottom-6",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0",
      )}
    >
      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M8 13V2M3.5 6.5 8 2l4.5 4.5" />
      </svg>
    </button>
  );
}

export default function PublicLayout() {
  return (
    <CartProvider>
      <div className="relative min-h-screen bg-ink text-cream">
        {/* subtle film grain noise overlay */}
        <div aria-hidden className="noise pointer-events-none fixed inset-0 z-[60] opacity-[0.05]" />

        <ScrollManager />
        <Navbar />

        <main>
          <Outlet />
        </main>

        <Footer />

        <CartDrawer />
        <FloatingOrderBar />
        <BackToTop />
      </div>
    </CartProvider>
  );
}
