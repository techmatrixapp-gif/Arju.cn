import type { Order, Booking, OrderStatus, BookingStatus } from "../types/firestore";
import { db } from "../firebase";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";

const ORDERS_KEY = "arju_orders_cache";
const BOOKINGS_KEY = "arju_bookings_cache";
const CHANNEL_NAME = "arju_live_channel";

// Setup broadcast channel for cross-tab communication
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch {
  // BroadcastChannel unavailable
}

// ---------------- ORDERS ---------------- //

export function getLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn("Failed to read local orders:", e);
    return [];
  }
}

export function saveLocalOrder(order: Order): void {
  try {
    const existing = getLocalOrders();
    // Prepend new order, deduplicate by id or orderNo
    const filtered = existing.filter(
      (o) => o.id !== order.id && (order.orderNo ? o.orderNo !== order.orderNo : true)
    );
    const updated = [order, ...filtered];
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));

    // Notify listeners
    window.dispatchEvent(new CustomEvent("arju_order_update", { detail: order }));
    broadcastChannel?.postMessage({ type: "NEW_ORDER", order });
  } catch (e) {
    console.warn("Failed to save local order:", e);
  }
}

export function updateLocalOrderStatus(orderId: string, newStatus: OrderStatus): void {
  try {
    const orders = getLocalOrders();
    const updated = orders.map((o) =>
      o.id === orderId || o.orderNo === orderId
        ? { ...o, orderStatus: newStatus, status: newStatus }
        : o
    );
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));

    window.dispatchEvent(new CustomEvent("arju_order_update", { detail: { id: orderId, newStatus } }));
    broadcastChannel?.postMessage({ type: "STATUS_UPDATE", orderId, newStatus });
  } catch (e) {
    console.warn("Failed to update local order status:", e);
  }
}

export function deleteLocalOrder(orderId: string): void {
  try {
    const orders = getLocalOrders();
    const filtered = orders.filter((o) => o.id !== orderId && o.orderNo !== orderId);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent("arju_order_update", { detail: { id: orderId, deleted: true } }));
    broadcastChannel?.postMessage({ type: "DELETE_ORDER", orderId });
  } catch (e) {
    console.warn("Failed to delete local order:", e);
  }
}

export function deleteLocalBooking(bookingId: string): void {
  try {
    const bookings = getLocalBookings();
    const filtered = bookings.filter((b) => b.id !== bookingId);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent("arju_booking_update", { detail: { id: bookingId, deleted: true } }));
    broadcastChannel?.postMessage({ type: "DELETE_BOOKING", bookingId });
  } catch (e) {
    console.warn("Failed to delete local booking:", e);
  }
}

// ---------------- BOOKINGS ---------------- //

export function getLocalBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn("Failed to read local bookings:", e);
    return [];
  }
}

export function saveLocalBooking(booking: Booking): void {
  try {
    const existing = getLocalBookings();
    const filtered = existing.filter((b) => b.id !== booking.id);
    const updated = [booking, ...filtered];
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updated));

    window.dispatchEvent(new CustomEvent("arju_booking_update", { detail: booking }));
    broadcastChannel?.postMessage({ type: "NEW_BOOKING", booking });
  } catch (e) {
    console.warn("Failed to save local booking:", e);
  }
}

export function updateLocalBookingStatus(bookingId: string, newStatus: BookingStatus): void {
  try {
    const bookings = getLocalBookings();
    const updated = bookings.map((b) =>
      b.id === bookingId ? { ...b, status: newStatus } : b
    );
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updated));

    window.dispatchEvent(new CustomEvent("arju_booking_update", { detail: { id: bookingId, newStatus } }));
    broadcastChannel?.postMessage({ type: "BOOKING_STATUS_UPDATE", bookingId, newStatus });
  } catch (e) {
    console.warn("Failed to update local booking status:", e);
  }
}

// ---------------- SYNC TO FIRESTORE ---------------- //

export async function syncLocalOrdersToFirestore(): Promise<{ synced: number }> {
  let syncedCount = 0;
  try {
    const localOrders = getLocalOrders();
    for (const order of localOrders) {
      if ((order as any)._syncedToFirestore) continue;
      try {
        if (order.id && !order.id.startsWith("local-")) {
          await setDoc(doc(db, "orders", order.id), { ...order, _syncedToFirestore: true }, { merge: true });
        } else {
          const docRef = await addDoc(collection(db, "orders"), {
            ...order,
            _syncedToFirestore: true,
          });
          order.id = docRef.id;
        }
        (order as any)._syncedToFirestore = true;
        syncedCount++;
      } catch (err) {
        console.warn("Could not sync order to Firestore:", err);
      }
    }
    localStorage.setItem(ORDERS_KEY, JSON.stringify(localOrders));
  } catch (e) {
    console.warn("Sync error:", e);
  }
  return { synced: syncedCount };
}

export async function syncLocalBookingsToFirestore(): Promise<{ synced: number }> {
  let syncedCount = 0;
  try {
    const localBookings = getLocalBookings();
    for (const booking of localBookings) {
      if ((booking as any)._syncedToFirestore) continue;
      try {
        if (booking.id && !booking.id.startsWith("local-")) {
          await setDoc(doc(db, "bookings", booking.id), { ...booking, _syncedToFirestore: true }, { merge: true });
        } else {
          const docRef = await addDoc(collection(db, "bookings"), {
            ...booking,
            _syncedToFirestore: true,
          });
          booking.id = docRef.id;
        }
        (booking as any)._syncedToFirestore = true;
        syncedCount++;
      } catch (err) {
        console.warn("Could not sync booking to Firestore:", err);
      }
    }
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(localBookings));
  } catch (e) {
    console.warn("Sync bookings error:", e);
  }
  return { synced: syncedCount };
}

