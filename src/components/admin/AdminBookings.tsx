import { useState, useEffect, useMemo } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import type { Booking, BookingStatus } from "../../types/firestore";
import {
  getLocalBookings,
  updateLocalBookingStatus,
  syncLocalBookingsToFirestore,
} from "../../services/localOrdersStore";
import { useAdminAuth } from "../../context/AdminAuthContext";
import {
  CalendarCheck2,
  Users,
  Clock,
  Phone,
  Mail,
  Search,
  CheckCircle2,
  XCircle,
  MessageSquare,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

export default function AdminBookings() {
  const { adminUser } = useAdminAuth();
  const [firestoreBookings, setFirestoreBookings] = useState<Booking[]>([]);
  const [localBookings, setLocalBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [firestoreWarning, setFirestoreWarning] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Notes editing state
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<string>("");

  useEffect(() => {
    setLocalBookings(getLocalBookings());

    const handleLocalUpdate = () => {
      setLocalBookings(getLocalBookings());
    };

    window.addEventListener("arju_booking_update", handleLocalUpdate);
    window.addEventListener("storage", handleLocalUpdate);

    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        channel = new BroadcastChannel("arju_live_channel");
        channel.onmessage = () => {
          setLocalBookings(getLocalBookings());
        };
      }
    } catch {
      // ignore
    }

    return () => {
      window.removeEventListener("arju_booking_update", handleLocalUpdate);
      window.removeEventListener("storage", handleLocalUpdate);
      channel?.close();
    };
  }, []);

  useEffect(() => {
    try {
      const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(
        q,
        (snap) => {
          setFirestoreBookings(
            snap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking))
          );
          setFirestoreWarning(null);
          setLoading(false);
        },
        (err) => {
          console.warn("Bookings listener error:", err);
          if (err.code === "permission-denied") {
            setFirestoreWarning(
              "Firestore Security Rules are currently restricting access. Bookings saved in the local browser buffer are shown below."
            );
          }
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn("Bookings firestore init error:", e);
      setLoading(false);
    }
  }, [adminUser]);

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

  const handleUpdateStatus = async (id: string, newStatus: BookingStatus) => {
    updateLocalBookingStatus(id, newStatus);
    setLocalBookings(getLocalBookings());

    try {
      await updateDoc(doc(db, "bookings", id), {
        status: newStatus,
      });
    } catch (e) {
      console.warn("Failed to update booking status in Firestore:", e);
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const res = await syncLocalBookingsToFirestore();
      if (res.synced > 0) {
        setLocalBookings(getLocalBookings());
      }
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveNotes = async (id: string) => {
    try {
      await updateDoc(doc(db, "bookings", id), {
        notes: notesDraft,
      });
      setEditingNotesId(null);
    } catch (e) {
      console.error("Failed to save notes:", e);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    const matchesDate = !dateFilter || b.date === dateFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      b.name?.toLowerCase().includes(q) ||
      b.phone?.includes(q) ||
      b.email?.toLowerCase().includes(q);

    return matchesStatus && matchesDate && matchesSearch;
  });

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
            Table Reservations
          </h1>
          <p className="text-xs text-stone tracking-wider mt-1">
            Review, confirm, or decline guest table requests
          </p>
        </div>
        {localBookings.length > 0 && (
          <button
            onClick={handleManualSync}
            disabled={syncing}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10 bg-charcoal text-stone hover:text-cream flex items-center gap-1.5 transition disabled:opacity-50 self-start sm:self-auto"
            title="Sync any unsynced local bookings to Firestore"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin text-crimson" : ""}`} />
            {syncing ? "Syncing..." : "Sync Database"}
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-coal border border-white/10 p-3 rounded-xl">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {["all", "pending", "confirmed", "cancelled"].map((status) => (
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
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-charcoal border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-cream focus:outline-none focus:border-crimson"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter("")}
              className="text-xs text-stone hover:text-cream px-1"
            >
              Clear
            </button>
          )}

          <div className="relative min-w-[180px]">
            <Search className="w-4 h-4 text-stone/60 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search guest..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-charcoal border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-cream placeholder:text-stone/40 focus:outline-none focus:border-crimson"
            />
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-coal border border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-stone">
            Loading reservations...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="py-16 text-center text-stone text-xs">
            <CalendarCheck2 className="w-8 h-8 mx-auto text-stone/40 mb-2" />
            No table reservations found matching filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone">
              <thead className="bg-charcoal text-stone uppercase tracking-wider text-[10px] border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Reservation Date & Time</th>
                  <th className="py-3 px-4">Guest Information</th>
                  <th className="py-3 px-4 text-center">Party Size</th>
                  <th className="py-3 px-4">Internal Staff Notes</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-charcoal/40 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-cream text-sm block">
                        {b.date}
                      </span>
                      <span className="text-stone text-xs flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-crimson" /> {b.time}
                      </span>
                      <span className="text-[10px] text-stone/50 block mt-1">
                        Booked: {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : ""}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-cream block text-sm">
                        {b.name}
                      </span>
                      <div className="flex items-center gap-3 text-stone text-[11px] mt-0.5">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {b.phone}
                        </span>
                        {b.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {b.email}
                          </span>
                        )}
                      </div>
                      {b.notes && (
                        <div className="text-[11px] text-amber-300/80 mt-1 italic">
                          "Guest requests: {b.notes}"
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/5 text-cream font-bold text-xs">
                        <Users className="w-3.5 h-3.5 text-stone" /> {b.partySize} Guests
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      {editingNotesId === b.id ? (
                        <div className="space-y-1.5">
                          <textarea
                            rows={2}
                            value={notesDraft}
                            onChange={(e) => setNotesDraft(e.target.value)}
                            placeholder="e.g. Table 4 assigned, VIP guest"
                            className="w-full bg-charcoal border border-white/15 rounded p-1.5 text-xs text-cream focus:outline-none focus:border-crimson"
                          />
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleSaveNotes(b.id)}
                              className="px-2 py-0.5 bg-crimson text-cream rounded text-[10px] font-medium"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingNotesId(null)}
                              className="px-2 py-0.5 bg-charcoal text-stone rounded text-[10px]"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setEditingNotesId(b.id);
                            setNotesDraft(b.notes || "");
                          }}
                          className="cursor-pointer group flex items-start gap-1 text-[11px] text-stone hover:text-cream"
                        >
                          <MessageSquare className="w-3 h-3 shrink-0 mt-0.5 text-stone/50 group-hover:text-crimson" />
                          <span className="italic">
                            {b.notes || "Click to add staff notes..."}
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold uppercase tracking-wider ${
                          b.status === "confirmed"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : b.status === "cancelled"
                            ? "bg-stone/20 text-stone border border-white/10"
                            : "bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {b.status !== "confirmed" && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, "confirmed")}
                            className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 rounded text-xs font-medium transition cursor-pointer flex items-center gap-1"
                            title="Confirm reservation"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Confirm
                          </button>
                        )}
                        {b.status !== "cancelled" && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, "cancelled")}
                            className="px-2.5 py-1 bg-crimson/20 text-crimson hover:bg-crimson/30 rounded text-xs font-medium transition cursor-pointer flex items-center gap-1"
                            title="Cancel reservation"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
