import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { useAdminAuth } from "../../context/AdminAuthContext";
import Logo from "../Logo";
import {
  LayoutDashboard,
  UtensilsCrossed,
  FolderTree,
  ShoppingBag,
  CalendarCheck2,
  Image as GalleryIcon,
  Star,
  Settings,
  LogOut,
  ExternalLink,
  Menu as MenuIcon,
  X,
  Bell,
} from "lucide-react";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { adminUser, isAdmin, loading } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!adminUser || !isAdmin)) {
      navigate("/admin/login");
    }
  }, [adminUser, isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex flex-col items-center justify-center text-cream">
        <div className="w-8 h-8 border-2 border-crimson border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs uppercase tracking-widest text-stone">Verifying Admin Permissions...</p>
      </div>
    );
  }

  if (!adminUser || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}

export default function AdminLayout() {
  const { adminUser, logout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Live badge counts
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [pendingBookingsCount, setPendingBookingsCount] = useState(0);

  useEffect(() => {
    // Listen for new or preparing orders
    try {
      const qOrders = query(
        collection(db, "orders"),
        where("orderStatus", "in", ["new", "confirmed", "preparing"])
      );
      const unsubOrders = onSnapshot(qOrders, (snap) => {
        setNewOrdersCount(snap.size);
      }, () => {
        // quiet fallback
      });

      // Listen for pending bookings
      const qBookings = query(
        collection(db, "bookings"),
        where("status", "==", "pending")
      );
      const unsubBookings = onSnapshot(qBookings, (snap) => {
        setPendingBookingsCount(snap.size);
      }, () => {
        // quiet fallback
      });

      return () => {
        unsubOrders();
        unsubBookings();
      };
    } catch (e) {
      // quiet fallback
    }
  }, []);

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Categories", href: "/admin/menu/categories", icon: FolderTree },
    { label: "Menu Items", href: "/admin/menu/items", icon: UtensilsCrossed },
    {
      label: "Orders",
      href: "/admin/orders",
      icon: ShoppingBag,
      badge: newOrdersCount > 0 ? newOrdersCount : undefined,
    },
    {
      label: "Bookings",
      href: "/admin/bookings",
      icon: CalendarCheck2,
      badge: pendingBookingsCount > 0 ? pendingBookingsCount : undefined,
    },
    { label: "Gallery", href: "/admin/gallery", icon: GalleryIcon },
    { label: "Reviews", href: "/admin/reviews", icon: Star },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-ink text-cream flex">
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-coal border-r border-white/10 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo variant="mark" className="h-7 text-crimson" />
            <div>
              <span className="font-display font-bold text-base tracking-wider block">ARJU</span>
              <span className="text-[10px] tracking-widest text-stone uppercase block -mt-1">
                Admin Console
              </span>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 text-stone hover:text-cream"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? location.pathname === "/admin"
                : location.pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium tracking-wide transition ${
                  isActive
                    ? "bg-crimson text-cream font-semibold shadow-sm"
                    : "text-stone hover:text-cream hover:bg-charcoal"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-cream" : "text-stone"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive
                        ? "bg-white text-crimson"
                        : "bg-crimson text-white animate-pulse"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Admin profile & actions */}
        <div className="p-4 border-t border-white/10 space-y-2 bg-charcoal/30">
          <div className="px-2 py-1">
            <p className="text-xs text-cream font-medium truncate">{adminUser?.email}</p>
            <span className="text-[10px] text-stone">Administrator</span>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 w-full px-3 py-2 rounded text-xs text-stone hover:text-cream hover:bg-charcoal transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Site</span>
          </a>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded text-xs text-crimson hover:bg-crimson/10 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top bar for mobile and alerts */}
        <header className="sticky top-0 z-30 bg-ink/90 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 text-stone hover:text-cream bg-coal rounded border border-white/10"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
            <span className="text-xs uppercase tracking-widest text-stone">
              Toronto, ON • Live System
            </span>
          </div>

          <div className="flex items-center gap-3">
            {(newOrdersCount > 0 || pendingBookingsCount > 0) && (
              <div className="flex items-center gap-2 bg-crimson/10 border border-crimson/30 px-2.5 py-1 rounded text-xs text-cream">
                <Bell className="w-3.5 h-3.5 text-crimson animate-bounce" />
                <span className="hidden sm:inline">Attention:</span>
                {newOrdersCount > 0 && <span>{newOrdersCount} New Orders</span>}
                {pendingBookingsCount > 0 && (
                  <span>• {pendingBookingsCount} Pending Bookings</span>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Dynamic route view */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
