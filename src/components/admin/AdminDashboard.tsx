import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import type { Order, Booking } from "../../types/firestore";
import {
  getLocalOrders,
  getLocalBookings,
  updateLocalOrderStatus,
  updateLocalBookingStatus,
} from "../../services/localOrdersStore";
import { useAdminAuth } from "../../context/AdminAuthContext";
import {
  ShoppingBag,
  CalendarCheck2,
  UtensilsCrossed,
  DollarSign,
  ChevronRight,
} from "lucide-react";

export default function AdminDashboard() {
  const { adminUser } = useAdminAuth();
  const [firestoreOrders, setFirestoreOrders] = useState<Order[]>([]);
  const [localOrders, setLocalOrders] = useState<Order[]>([]);
  const [firestoreBookings, setFirestoreBookings] = useState<Booking[]>([]);
  const [localBookings, setLocalBookings] = useState<Booking[]>([]);
  const [totalItemsCount, setTotalItemsCount] = useState(0);

  // Local storage listeners
  useEffect(() => {
    setLocalOrders(getLocalOrders());
    setLocalBookings(getLocalBookings());

    const onOrderUpdate = () => setLocalOrders(getLocalOrders());
    const onBookingUpdate = () => setLocalBookings(getLocalBookings());

    window.addEventListener("arju_order_update", onOrderUpdate);
    window.addEventListener("arju_booking_update", onBookingUpdate);
    window.addEventListener("storage", () => {
      setLocalOrders(getLocalOrders());
      setLocalBookings(getLocalBookings());
    });

    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        channel = new BroadcastChannel("arju_live_channel");
        channel.onmessage = () => {
          setLocalOrders(getLocalOrders());
          setLocalBookings(getLocalBookings());
        };
      }
    } catch {
      // ignore
    }

    return () => {
      window.removeEventListener("arju_order_update", onOrderUpdate);
      window.removeEventListener("arju_booking_update", onBookingUpdate);
      channel?.close();
    };
  }, []);

  useEffect(() => {
    // Recent orders from Firestore
    try {
      const qOrders = query(
        collection(db, "orders"),
        orderBy("createdAt", "desc"),
        limit(20)
      );
      const unsubOrders = onSnapshot(
        qOrders,
        (snap) => {
          setFirestoreOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order)));
        },
        (err) => {
          if (err.code !== "permission-denied") {
            console.warn("Dashboard orders listener:", err);
          }
        }
      );

      // Recent bookings from Firestore
      const qBookings = query(
        collection(db, "bookings"),
        orderBy("createdAt", "desc"),
        limit(20)
      );
      const unsubBookings = onSnapshot(
        qBookings,
        (snap) => {
          setFirestoreBookings(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking)));
        },
        (err) => {
          if (err.code !== "permission-denied") {
            console.warn("Dashboard bookings listener:", err);
          }
        }
      );

      // Menu count
      const unsubItems = onSnapshot(
        collection(db, "menuItems"),
        (snap) => {
          setTotalItemsCount(snap.size);
        },
        (err) => {
          if (err.code !== "permission-denied") {
            console.warn("Dashboard items listener:", err);
          }
        }
      );

      return () => {
        unsubOrders();
        unsubBookings();
        unsubItems();
      };
    } catch (e) {
      console.warn("Dashboard firestore init error:", e);
    }
  }, [adminUser]);

  // Merge orders
  const orders: Order[] = useMemo(() => {
    const map = new Map<string, Order>();
    for (const ord of firestoreOrders) {
      const key = ord.orderNo || ord.id;
      if (key) map.set(key, ord);
    }
    for (const ord of localOrders) {
      const key = ord.orderNo || ord.id;
      if (key && !map.has(key)) map.set(key, ord);
    }
    return Array.from(map.values()).sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  }, [firestoreOrders, localOrders]);

  // Merge bookings
  const bookings: Booking[] = useMemo(() => {
    const map = new Map<string, Booking>();
    for (const b of firestoreBookings) {
      if (b.id) map.set(b.id, b);
    }
    for (const b of localBookings) {
      if (b.id && !map.has(b.id)) map.set(b.id, b);
    }
    return Array.from(map.values()).sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  }, [firestoreBookings, localBookings]);

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  const pendingOrders = orders.filter((o) => {
    const s = o.orderStatus || (o as any).status || "new";
    return s === "new" || s === "preparing" || s === "confirmed";
  });

  const pendingBookings = bookings.filter((b) => b.status === "pending");

  const handleUpdateOrderStatus = async (orderId: string, newStatus: any) => {
    updateLocalOrderStatus(orderId, newStatus);
    setLocalOrders(getLocalOrders());
    try {
      await updateDoc(doc(db, "orders", orderId), {
        orderStatus: newStatus,
        status: newStatus,
      });
    } catch (e) {
      console.warn("Failed to update status in Firestore:", e);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: any) => {
    updateLocalBookingStatus(bookingId, newStatus);
    setLocalBookings(getLocalBookings());
    try {
      await updateDoc(doc(db, "bookings", bookingId), { status: newStatus });
    } catch (e) {
      console.warn("Failed to update booking status in Firestore:", e);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-cream">
            Dashboard Overview
          </h1>
          <p className="text-xs text-stone tracking-wider mt-1">
            Real-time operations, active orders, and pending reservations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/menu/items"
            className="px-3 py-1.5 bg-coal border border-white/10 hover:border-crimson rounded-lg text-xs font-medium text-cream transition"
          >
            Manage Menu
          </Link>
          <Link
            to="/admin/orders"
            className="px-3 py-1.5 bg-crimson hover:bg-crimson-bright rounded-lg text-xs font-medium text-cream transition"
          >
            All Orders ({orders.length})
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-coal border border-white/10 p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-stone font-medium">
              Active Orders
            </span>
            <div className="w-8 h-8 rounded-lg bg-crimson/15 text-crimson flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-cream">{pendingOrders.length}</span>
            <span className="text-xs text-stone">needing attention</span>
          </div>
        </div>

        <div className="bg-coal border border-white/10 p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-stone font-medium">
              Pending Bookings
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-cream">{pendingBookings.length}</span>
            <span className="text-xs text-stone">awaiting confirmation</span>
          </div>
        </div>

        <div className="bg-coal border border-white/10 p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-stone font-medium">
              Paid Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-cream">
              ${totalRevenue.toFixed(2)}
            </span>
            <span className="text-xs text-stone">CAD</span>
          </div>
        </div>

        <div className="bg-coal border border-white/10 p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-stone font-medium">
              Menu Items
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-cream">{totalItemsCount}</span>
            <span className="text-xs text-stone">in database</span>
          </div>
        </div>
      </div>

      {/* Two columns: Recent Orders & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-coal border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-crimson" />
              <h2 className="text-base font-semibold text-cream">Live Orders</h2>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs text-stone hover:text-cream flex items-center gap-1"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="py-10 text-center text-xs text-stone">
              No orders placed yet. As customers order food, they appear here in real time.
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="bg-charcoal/60 border border-white/5 p-3.5 rounded-lg flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-cream">
                        {order.customer?.name || (order as any).customerName || "Guest"}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded uppercase font-medium tracking-wider bg-white/5 text-stone">
                        {order.type || (order as any).orderType || "order"}
                      </span>
                    </div>
                    <p className="text-stone text-[11px] mt-0.5">
                      {order.items?.length || 0} items • ${Number(order.total).toFixed(2)} CAD
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={order.orderStatus || (order as any).status || "new"}
                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                      className="bg-coal border border-white/10 text-[11px] text-cream rounded px-2 py-1 focus:outline-none focus:border-crimson"
                    >
                      <option value="new">New</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="bg-coal border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarCheck2 className="w-4 h-4 text-amber-400" />
              <h2 className="text-base font-semibold text-cream">Table Reservations</h2>
            </div>
            <Link
              to="/admin/bookings"
              className="text-xs text-stone hover:text-cream flex items-center gap-1"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="py-10 text-center text-xs text-stone">
              No reservations booked yet. When customers reserve a table, they appear here live.
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className="bg-charcoal/60 border border-white/5 p-3.5 rounded-lg flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-cream">{booking.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-stone">
                        {booking.partySize} Guests
                      </span>
                    </div>
                    <p className="text-stone text-[11px] mt-0.5">
                      {booking.date} at {booking.time} • {booking.phone}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {booking.status === "pending" ? (
                      <>
                        <button
                          onClick={() => handleUpdateBookingStatus(booking.id, "confirmed")}
                          className="px-2 py-1 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 rounded text-[11px] font-medium transition cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleUpdateBookingStatus(booking.id, "cancelled")}
                          className="px-2 py-1 bg-crimson/20 text-crimson hover:bg-crimson/30 rounded text-[11px] font-medium transition cursor-pointer"
                        >
                          Decline
                        </button>
                      </>
                    ) : (
                      <span
                        className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
                          booking.status === "confirmed"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-stone/20 text-stone"
                        }`}
                      >
                        {booking.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
