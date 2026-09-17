import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { cn } from "./utils/cn";
import { CartProvider, useCart } from "./context/CartContext";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import Story from "./components/Story";
import MenuSection from "./components/MenuSection";
import OrderSection from "./components/OrderSection";
import Gallery from "./components/Gallery";
import Testimonials from "./components/Testimonials";
import Visit from "./components/Visit";
import Footer from "./components/Footer";
import { CartDrawer, FloatingOrderBar } from "./components/CartDrawer";

// Admin components
import AdminLogin from "./components/admin/AdminLogin";
import AdminLayout, { RequireAdmin } from "./components/admin/AdminLayout";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminCategories from "./components/admin/AdminCategories";
import AdminMenuItems from "./components/admin/AdminMenuItems";
import AdminOrders from "./components/admin/AdminOrders";
import AdminBookings from "./components/admin/AdminBookings";
import AdminGallery from "./components/admin/AdminGallery";
import AdminReviews from "./components/admin/AdminReviews";
import AdminSettings from "./components/admin/AdminSettings";

function BackToTop() {
  const [show, setShow] = useState(false);
  const { count } = useCart();

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
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
        // lift above the mobile floating order bar when it's visible
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

function PublicSite() {
  return (
    <CartProvider>
      <div className="relative min-h-screen bg-ink text-cream">
        {/* film grain over everything */}
        <div aria-hidden className="noise pointer-events-none fixed inset-0 z-[60] opacity-[0.05]" />

        <Navbar />
        <main>
          <Hero />
          <Marquee />
          <Story />
          <MenuSection />
          <OrderSection />
          <Gallery />
          <Testimonials />
          <Visit />
        </main>
        <Footer />

        <CartDrawer />
        <FloatingOrderBar />
        <BackToTop />
      </div>
    </CartProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public customer-facing website */}
        <Route path="/" element={<PublicSite />} />

        {/* Admin Login */}
        <Route
          path="/admin/login"
          element={
            <AdminAuthProvider>
              <AdminLogin />
            </AdminAuthProvider>
          }
        />

        {/* Protected Admin Panel */}
        <Route
          path="/admin"
          element={
            <AdminAuthProvider>
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            </AdminAuthProvider>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="menu/categories" element={<AdminCategories />} />
          <Route path="categories" element={<Navigate to="/admin/menu/categories" replace />} />
          <Route path="menu/items" element={<AdminMenuItems />} />
          <Route path="items" element={<Navigate to="/admin/menu/items" replace />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Fallback to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
