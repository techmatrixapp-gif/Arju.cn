import { useState, useEffect, useMemo } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import type { Order, OrderStatus } from "../../types/firestore";
import {
  getLocalOrders,
  updateLocalOrderStatus,
  syncLocalOrdersToFirestore,
  deleteLocalOrder,
  saveLocalOrder,
} from "../../services/localOrdersStore";
import { useAdminAuth } from "../../context/AdminAuthContext";
import {
  ShoppingBag,
  Eye,
  X,
  Search,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  AlertTriangle,
  Trash2,
  Plus,
} from "lucide-react";

export default function AdminOrders() {
  const { adminUser } = useAdminAuth();
  const [firestoreOrders, setFirestoreOrders] = useState<Order[]>([]);
  const [localOrders, setLocalOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [firestoreWarning, setFirestoreWarning] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<"today" | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Load initial local orders & listen for updates
  useEffect(() => {
    setLocalOrders(getLocalOrders());

    const handleLocalUpdate = () => {
      setLocalOrders(getLocalOrders());
    };

    window.addEventListener("arju_order_update", handleLocalUpdate);
    window.addEventListener("storage", handleLocalUpdate);

    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        channel = new BroadcastChannel("arju_live_channel");
        channel.onmessage = () => {
          setLocalOrders(getLocalOrders());
        };
      }
    } catch {
      // ignore
    }

    return () => {
      window.removeEventListener("arju_order_update", handleLocalUpdate);
      window.removeEventListener("storage", handleLocalUpdate);
      channel?.close();
    };
  }, []);

  // Listen to Firestore
  useEffect(() => {
    try {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(
        q,
        (snap) => {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
          setFirestoreOrders(list);
          setFirestoreWarning(null);
          setLoading(false);
        },
        (err) => {
          console.warn("Orders listener error:", err);
          if (err.code === "permission-denied") {
            setFirestoreWarning(
              "Firestore Security Rules are currently restricting access. Orders saved in the local browser buffer are shown below."
            );
          }
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } catch (e: any) {
      console.warn("Orders init query error:", e);
      setLoading(false);
    }
  }, [adminUser]);

  // Merge Firestore and local orders, deduplicating by ID or orderNo
  const orders: Order[] = useMemo(() => {
    const map = new Map<string, Order>();

    // Put firestore orders first
    for (const ord of firestoreOrders) {
      const key = ord.orderNo || ord.id;
      if (key) map.set(key, ord);
    }

    // Overlay or add local orders
    for (const ord of localOrders) {
      const key = ord.orderNo || ord.id;
      if (key && !map.has(key)) {
        map.set(key, ord);
      }
    }

    // Sort descending by createdAt
    return Array.from(map.values()).sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  }, [firestoreOrders, localOrders]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    // 1. Update local store
    updateLocalOrderStatus(orderId, newStatus);
    setLocalOrders(getLocalOrders());

    // 2. Update Firestore
    try {
      await updateDoc(doc(db, "orders", orderId), {
        orderStatus: newStatus,
        status: newStatus,
      });
    } catch (e) {
      console.warn("Failed to update status in Firestore (status updated locally):", e);
    }

    if (selectedOrder && (selectedOrder.id === orderId || selectedOrder.orderNo === orderId)) {
      setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const res = await syncLocalOrdersToFirestore();
      if (res.synced > 0) {
        setLocalOrders(getLocalOrders());
      }
    } finally {
      setSyncing(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to permanently remove this order?")) return;
    deleteLocalOrder(orderId);
    setLocalOrders(getLocalOrders());
    setFirestoreOrders((prev) => prev.filter((o) => o.id !== orderId && o.orderNo !== orderId));
    try {
      await deleteDoc(doc(db, "orders", orderId)).catch(() => {});
    } catch (e) {
      console.warn("Delete order error:", e);
    }
    if (selectedOrder && (selectedOrder.id === orderId || selectedOrder.orderNo === orderId)) {
      setSelectedOrder(null);
    }
  };

  const handleCreateSampleOrder = async () => {
    const newId = `ord-${Date.now().toString().slice(-6)}`;
    const sampleOrder: Order = {
      id: newId,
      orderNo: newId,
      type: "pickup",
      customer: {
        name: "Aarav Patel",
        phone: "(647) 555-0198",
        email: "aarav.p@example.com",
      },
      items: [
        { itemId: "item-biryani-lamb", name: "Lamb Dum Biryani", price: 21.99, qty: 1 },
        { itemId: "item-margherita-doc", name: "Margherita D.O.C. Pizza", price: 18.99, qty: 1 },
      ],
      subtotal: 40.98,
      tax: 5.33,
      deliveryFee: 0,
      total: 52.46,
      orderStatus: "new",
      paymentStatus: "paid",
      paymentMethod: "card",
      paymentRef: `pi_demo_${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
    };

    saveLocalOrder(sampleOrder);
    setLocalOrders(getLocalOrders());
    try {
      await setDoc(doc(db, "orders", newId), sampleOrder);
    } catch (e) {
      console.warn("Create sample order error:", e);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  const filteredOrders = orders.filter((order) => {
    const effectiveStatus = order.orderStatus || (order as any).status || "new";
    const matchesStatus = statusFilter === "all" || effectiveStatus === statusFilter;
    const matchesDate =
      dateFilter === "all" || (order.createdAt && String(order.createdAt).startsWith(todayStr));
    const query = searchQuery.toLowerCase();
    const customerName = order.customer?.name || (order as any).customerName || "";
    const customerPhone = order.customer?.phone || (order as any).customerPhone || "";
    const orderNo = order.orderNo || order.id || "";
    const matchesSearch =
      !query ||
      customerName.toLowerCase().includes(query) ||
      customerPhone.includes(query) ||
      orderNo.toLowerCase().includes(query);

    return matchesStatus && matchesDate && matchesSearch;
  });

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "new":
        return "bg-crimson/20 text-crimson-bright border-crimson/40";
      case "confirmed":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "preparing":
        return "bg-blue-500/20 text-blue-300 border-blue-500/40";
      case "ready":
        return "bg-purple-500/20 text-purple-300 border-purple-500/40";
      case "completed":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
      case "cancelled":
        return "bg-stone/20 text-stone border-stone/40";
      default:
        return "bg-charcoal text-cream border-white/10";
    }
  };

  return (
    <div className="space-y-6">
      {/* Firestore Warning if security rules or permissions deny access */}
      {firestoreWarning && (
        <div className="bg-amber-500/15 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3 text-amber-200 text-xs">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-100">Live Database Notice</p>
            <p className="text-stone leading-relaxed">{firestoreWarning}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-cream">
            Customer Orders
          </h1>
          <p className="text-xs text-stone tracking-wider mt-1">
            Real-time feed of online takeout and delivery orders
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCreateSampleOrder}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10 bg-charcoal text-stone hover:text-cream flex items-center gap-1.5 transition"
            title="Create a sample order for testing"
          >
            <Plus className="w-3.5 h-3.5 text-crimson" />
            Add Test Order
          </button>
          {localOrders.length > 0 && (
            <button
              onClick={handleManualSync}
              disabled={syncing}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10 bg-charcoal text-stone hover:text-cream flex items-center gap-1.5 transition disabled:opacity-50"
              title="Sync any unsynced local orders to Firestore"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin text-crimson" : ""}`} />
              {syncing ? "Syncing..." : "Sync Database"}
            </button>
          )}
          <button
            onClick={() => setDateFilter(dateFilter === "today" ? "all" : "today")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              dateFilter === "today"
                ? "bg-crimson border-crimson text-cream"
                : "bg-coal border-white/10 text-stone hover:text-cream"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 inline mr-1" />
            {dateFilter === "today" ? "Showing Today Only" : "Filter Today"}
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-coal border border-white/10 p-3 rounded-xl">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {["all", "new", "confirmed", "preparing", "ready", "completed", "cancelled"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition ${
                  statusFilter === status
                    ? "bg-crimson text-cream"
                    : "text-stone hover:text-cream bg-charcoal"
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>

        <div className="relative min-w-[200px]">
          <Search className="w-4 h-4 text-stone/60 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order #, name, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-charcoal border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-cream placeholder:text-stone/40 focus:outline-none focus:border-crimson"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-coal border border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-stone">
            Loading live orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-stone text-xs">
            <ShoppingBag className="w-8 h-8 mx-auto text-stone/40 mb-2" />
            No orders match the current filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone">
              <thead className="bg-charcoal text-stone uppercase tracking-wider text-[10px] border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Order ID & Time</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total & Payment</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.map((order) => {
                  const dateFormatted = order.createdAt
                    ? new Date(order.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—";

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-charcoal/40 transition cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="py-3 px-4">
                        <span className="font-mono text-cream font-medium block">
                          {order.orderNo || `#${order.id.slice(-6).toUpperCase()}`}
                        </span>
                        <span className="text-[10px] text-stone">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ""} {dateFormatted}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-medium text-cream block">
                          {order.customer?.name || (order as any).customerName || "Guest Customer"}
                        </span>
                        <span className="text-[10px] text-stone">
                          {order.customer?.phone || (order as any).customerPhone || "No phone"}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded uppercase text-[10px] font-bold tracking-wider bg-white/5 text-stone">
                          {order.type || (order as any).orderType || "order"}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-cream font-medium">
                          {order.items?.length || 0} items
                        </span>
                        <span className="text-[10px] text-stone block truncate max-w-[150px]">
                          {order.items?.map((i) => i.name).join(", ")}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-cream block">
                          ${Number(order.total).toFixed(2)} CAD
                        </span>
                        <span
                          className={`text-[10px] font-medium uppercase ${
                            order.paymentStatus === "paid"
                              ? "text-emerald-400"
                              : "text-amber-400"
                          }`}
                        >
                          {order.paymentStatus} • {order.paymentMethod}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={order.orderStatus || (order as any).status || "new"}
                          onChange={(e) =>
                            handleUpdateStatus(order.id, e.target.value as OrderStatus)
                          }
                          className={`border rounded px-2 py-1 text-[11px] font-medium focus:outline-none focus:ring-1 focus:ring-crimson ${getStatusBadge(
                            order.orderStatus || (order as any).status || "new"
                          )}`}
                        >
                          <option value="new">New</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="preparing">Preparing</option>
                          <option value="ready">Ready</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 text-stone hover:text-cream hover:bg-charcoal rounded transition"
                            title="View order details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order.id || order.orderNo || "")}
                            className="p-1.5 text-stone hover:text-crimson hover:bg-charcoal rounded transition"
                            title="Delete order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-coal border border-white/15 rounded-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="font-display font-bold text-lg text-cream">
                  Order Details
                </h3>
                <p className="text-xs text-stone font-mono">
                  #{selectedOrder.id} • {selectedOrder.createdAt}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-stone hover:text-cream"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Control */}
            <div className="bg-charcoal/50 p-3.5 rounded-lg border border-white/5 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-stone font-medium">
                Current Order Status:
              </span>
              <select
                value={selectedOrder.orderStatus}
                onChange={(e) =>
                  handleUpdateStatus(
                    selectedOrder.id,
                    e.target.value as OrderStatus
                  )
                }
                className={`border rounded px-3 py-1.5 text-xs font-medium focus:outline-none ${getStatusBadge(
                  selectedOrder.orderStatus || (selectedOrder as any).status || "new"
                )}`}
              >
                <option value="new">New</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Customer Details */}
            <div className="space-y-2 text-xs">
              <h4 className="font-semibold text-cream uppercase tracking-wider text-[11px]">
                Customer Information
              </h4>
              <div className="bg-charcoal/30 border border-white/5 p-3 rounded-lg space-y-1.5">
                <div className="flex items-center gap-2 text-cream">
                  <User className="w-3.5 h-3.5 text-stone" />
                  <span className="font-medium">
                    {selectedOrder.customer?.name || (selectedOrder as any).customerName || "Guest Customer"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-stone">
                  <Phone className="w-3.5 h-3.5 text-stone" />
                  <span>{selectedOrder.customer?.phone || (selectedOrder as any).customerPhone || "No phone"}</span>
                </div>
                {(selectedOrder.customer?.email || (selectedOrder as any).customerEmail) && (
                  <div className="flex items-center gap-2 text-stone">
                    <Mail className="w-3.5 h-3.5 text-stone" />
                    <span>{selectedOrder.customer?.email || (selectedOrder as any).customerEmail}</span>
                  </div>
                )}
                {(selectedOrder.type === "delivery" || (selectedOrder as any).orderType === "delivery") && (
                  <div className="flex items-start gap-2 text-stone pt-1">
                    <MapPin className="w-3.5 h-3.5 text-crimson shrink-0 mt-0.5" />
                    <span>
                      {selectedOrder.customer?.address ||
                        (selectedOrder as any).deliveryAddress ||
                        "No address provided"}
                      {selectedOrder.customer?.postalCode &&
                        `, ${selectedOrder.customer.postalCode}`}
                    </span>
                  </div>
                )}
                {(selectedOrder.customer?.notes || selectedOrder.notes) && (
                  <div className="pt-2 text-stone italic border-t border-white/5">
                    "Special instructions: {selectedOrder.customer?.notes || selectedOrder.notes}"
                  </div>
                )}
              </div>
            </div>

            {/* Line items breakdown */}
            <div className="space-y-2 text-xs">
              <h4 className="font-semibold text-cream uppercase tracking-wider text-[11px]">
                Ordered Items
              </h4>
              <div className="bg-charcoal/30 border border-white/5 divide-y divide-white/5 rounded-lg overflow-hidden">
                {selectedOrder.items?.map((item: any, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-medium text-cream">
                        {item.qty || item.quantity || 1}x {item.name}
                      </span>
                      {item.variant && (
                        <span className="text-[11px] text-stone block">
                          Size: {item.variant}
                        </span>
                      )}
                      {item.notes && (
                        <span className="text-[10px] text-amber-300/80 block">
                          Note: {item.notes}
                        </span>
                      )}
                    </div>
                    <span className="font-semibold text-cream">
                      ${(Number(item.price) * (item.qty || item.quantity || 1)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculation summary */}
            <div className="bg-charcoal/50 p-3 rounded-lg space-y-1.5 text-xs text-stone border border-white/5">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-cream">${Number(selectedOrder.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>HST (13%)</span>
                <span className="text-cream">${Number(selectedOrder.tax).toFixed(2)}</span>
              </div>
              {Number(selectedOrder.deliveryFee) > 0 && (
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="text-cream">
                    ${Number(selectedOrder.deliveryFee).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-cream pt-2 border-t border-white/10">
                <span>Total Amount</span>
                <span className="text-crimson">${Number(selectedOrder.total).toFixed(2)} CAD</span>
              </div>
              <div className="pt-2 flex items-center justify-between text-[11px]">
                <span>Payment Status</span>
                <span className="font-semibold uppercase text-cream">
                  {selectedOrder.paymentStatus} ({selectedOrder.paymentMethod})
                </span>
              </div>
              {selectedOrder.paymentRef && (
                <div className="text-[10px] text-stone truncate">
                  Ref: {selectedOrder.paymentRef}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => handleDeleteOrder(selectedOrder.id || selectedOrder.orderNo || "")}
                className="px-3 py-2 bg-crimson/20 hover:bg-crimson/30 text-crimson text-xs font-medium rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Order
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-charcoal hover:bg-white/10 text-xs font-medium text-cream rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
