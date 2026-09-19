import React, { useState, useEffect, useMemo } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
} from "date-fns";
import { db } from "../../firebase";
import type { Booking, BookingStatus, BlockedSlot } from "../../types/firestore";
import {
  CalendarCheck2,
  Calendar as CalendarIcon,
  LayoutList,
  Clock,
  Phone,
  Mail,
  Search,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit2,
  Ban,
  Check,
  X,
} from "lucide-react";

const STANDARD_TIMES = [
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
];

const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  pending: {
    label: "Pending",
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    border: "border-amber-500/30",
    dot: "bg-amber-400",
  },
  confirmed: {
    label: "Confirmed",
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  declined: {
    label: "Declined",
    bg: "bg-rose-500/15",
    text: "text-rose-400",
    border: "border-rose-500/30",
    dot: "bg-rose-400",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-stone-500/15",
    text: "text-stone-400",
    border: "border-stone-500/30",
    dot: "bg-stone-400",
  },
};

export default function AdminBookings() {
  const [viewMode, setViewMode] = useState<"cards" | "calendar">("cards");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Calendar State
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());

  // Action Modals
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    date: "",
    time: "",
    partySize: 2,
    tableNumber: "",
    notes: "",
    status: "pending" as BookingStatus,
  });

  // Block Slot Modal
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockSlotData, setBlockSlotData] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    time: "all-day",
    reason: "Private Event / Full Capacity",
  });

  // Real-time Firestore Listeners
  useEffect(() => {
    // 1. Listen to bookings
    const qBookings = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
    const unsubBookings = onSnapshot(
      qBookings,
      (snap) => {
        const list: Booking[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            customerName: data.customerName || data.name || "Guest",
            name: data.customerName || data.name || "Guest",
            phone: data.phone || "",
            email: data.email || "",
            partySize: Number(data.partySize) || 2,
            date: data.date,
            time: data.time,
            status: (data.status as BookingStatus) || "pending",
            notes: data.notes || "",
            internalNotes: data.internalNotes || "",
            tableNumber: data.tableNumber || "",
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };
        });
        setBookings(list);
      },
      (err) => {
        console.warn("Bookings listener warning:", err);
      }
    );

    // 2. Listen to blockedSlots
    const qBlocked = query(collection(db, "blockedSlots"));
    const unsubBlocked = onSnapshot(
      qBlocked,
      (snap) => {
        const list: BlockedSlot[] = snap.docs.map((d) => ({
          id: d.id,
          date: d.data().date,
          time: d.data().time || "all-day",
          reason: d.data().reason || "Blocked",
          createdAt: d.data().createdAt,
        }));
        setBlockedSlots(list);
      },
      (err) => {
        console.warn("Blocked slots listener warning:", err);
      }
    );

    return () => {
      unsubBookings();
      unsubBlocked();
    };
  }, []);

  // Update Status helper
  const handleUpdateStatus = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      setStatusMessage(`Booking updated to ${newStatus}.`);
      setTimeout(() => setStatusMessage(null), 3500);
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking({ ...selectedBooking, status: newStatus });
      }
    } catch (err: any) {
      console.error("Failed to update status:", err);
      alert(`Error updating booking status: ${err.message}`);
    }
  };

  // Delete Booking helper
  const handleDeleteBooking = async (bookingId: string) => {
    if (!window.confirm("Are you sure you want to delete this reservation?")) return;
    try {
      await deleteDoc(doc(db, "bookings", bookingId));
      setSelectedBooking(null);
      setEditModalOpen(false);
      setStatusMessage("Reservation deleted.");
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: any) {
      alert(`Error deleting booking: ${err.message}`);
    }
  };

  // Save Edit / Reschedule
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    try {
      await updateDoc(doc(db, "bookings", selectedBooking.id), {
        date: editFormData.date,
        time: editFormData.time,
        partySize: Number(editFormData.partySize),
        tableNumber: editFormData.tableNumber.trim(),
        notes: editFormData.notes.trim(),
        status: editFormData.status,
        updatedAt: serverTimestamp(),
      });
      setEditModalOpen(false);
      setStatusMessage("Reservation rescheduled and updated.");
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: any) {
      alert(`Error updating reservation: ${err.message}`);
    }
  };

  // Block a slot
  const handleSaveBlockedSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slotId = `slot-${blockSlotData.date}-${blockSlotData.time.replace(":", "")}-${Date.now()}`;
      await setDoc(doc(db, "blockedSlots", slotId), {
        id: slotId,
        date: blockSlotData.date,
        time: blockSlotData.time,
        reason: blockSlotData.reason.trim(),
        createdAt: serverTimestamp(),
      });
      setBlockModalOpen(false);
      setStatusMessage(`Slot ${blockSlotData.date} (${blockSlotData.time}) blocked.`);
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: any) {
      alert(`Error blocking slot: ${err.message}`);
    }
  };

  // Unblock a slot
  const handleDeleteBlockedSlot = async (slotId: string) => {
    try {
      await deleteDoc(doc(db, "blockedSlots", slotId));
      setStatusMessage("Slot unblocked.");
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: any) {
      alert(`Error unblocking slot: ${err.message}`);
    }
  };

  // Filtered Bookings for Card List
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (dateFilter && b.date !== dateFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (b.customerName || b.name || "").toLowerCase().includes(q);
        const matchPhone = (b.phone || "").toLowerCase().includes(q);
        const matchEmail = (b.email || "").toLowerCase().includes(q);
        const matchTable = (b.tableNumber || "").toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchEmail && !matchTable) return false;
      }
      return true;
    });
  }, [bookings, statusFilter, dateFilter, searchQuery]);

  // Calendar calculations
  const monthStart = startOfMonth(currentCalendarMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const selectedDayFormatted = format(selectedDay, "yyyy-MM-dd");
  const selectedDayBookings = useMemo(() => {
    return bookings.filter((b) => b.date === selectedDayFormatted);
  }, [bookings, selectedDayFormatted]);

  const selectedDayBlocked = useMemo(() => {
    return blockedSlots.filter((s) => s.date === selectedDayFormatted);
  }, [blockedSlots, selectedDayFormatted]);

  // Open Edit Modal
  const openEditModalFor = (booking: Booking) => {
    setSelectedBooking(booking);
    setEditFormData({
      date: booking.date,
      time: booking.time,
      partySize: booking.partySize,
      tableNumber: booking.tableNumber || "",
      notes: booking.notes || "",
      status: booking.status,
    });
    setEditModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & View Switcher */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-crimson/15 text-crimson-bright border border-crimson/30">
              <CalendarCheck2 className="h-5 w-5" />
            </span>
            <h1 className="font-display text-2xl font-bold text-cream">Table Reservations</h1>
          </div>
          <p className="mt-1.5 text-xs text-stone">
            Manage guest reservations, review incoming requests, assign tables, and block time slots.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex rounded border border-white/15 bg-white/5 p-0.5">
            <button
              onClick={() => setViewMode("cards")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                viewMode === "cards"
                  ? "bg-crimson text-cream shadow-sm"
                  : "text-stone hover:text-cream"
              }`}
            >
              <LayoutList className="h-3.5 w-3.5" />
              Cards ({filteredBookings.length})
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                viewMode === "calendar"
                  ? "bg-crimson text-cream shadow-sm"
                  : "text-stone hover:text-cream"
              }`}
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              Calendar View
            </button>
          </div>

          {/* Block Slot Action */}
          <button
            onClick={() => {
              setBlockSlotData({
                date: format(selectedDay, "yyyy-MM-dd"),
                time: "all-day",
                reason: "Private Event / Full Capacity",
              });
              setBlockModalOpen(true);
            }}
            className="inline-flex items-center gap-2 border border-rose-500/40 bg-rose-950/30 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-rose-300 hover:bg-rose-900/40 transition-colors cursor-pointer"
          >
            <Ban className="h-3.5 w-3.5" />
            Block Slot
          </button>
        </div>
      </div>

      {/* Notifications */}
      {statusMessage && (
        <div className="flex items-center gap-3 border border-emerald-500/40 bg-emerald-950/40 px-4 py-3 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="border border-white/10 bg-coal p-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400 block">
            Pending Approval
          </span>
          <p className="mt-1 font-display text-2xl font-bold text-cream">
            {bookings.filter((b) => b.status === "pending").length}
          </p>
        </div>
        <div className="border border-white/10 bg-coal p-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 block">
            Confirmed Guests
          </span>
          <p className="mt-1 font-display text-2xl font-bold text-cream">
            {bookings.filter((b) => b.status === "confirmed").length}
          </p>
        </div>
        <div className="border border-white/10 bg-coal p-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-stone block">
            Declined / Cancelled
          </span>
          <p className="mt-1 font-display text-2xl font-bold text-stone">
            {bookings.filter((b) => b.status === "declined" || b.status === "cancelled").length}
          </p>
        </div>
        <div className="border border-white/10 bg-coal p-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-400 block">
            Active Blocked Slots
          </span>
          <p className="mt-1 font-display text-2xl font-bold text-rose-300">
            {blockedSlots.length}
          </p>
        </div>
      </div>

      {/* VIEW 1: CARD LIST VIEW */}
      {viewMode === "cards" && (
        <div className="space-y-6">
          {/* Filters toolbar */}
          <div className="flex flex-wrap items-center gap-3 border border-white/10 bg-coal p-4">
            <div className="relative min-w-[220px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guest name, phone, table..."
                className="w-full border border-white/15 bg-ink pl-9 pr-3 py-2 text-xs text-cream placeholder-stone/60 focus:border-crimson focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-stone">
                Status:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-white/15 bg-ink px-3 py-2 text-xs text-cream focus:border-crimson focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="declined">Declined</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-stone">
                Date:
              </span>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="border border-white/15 bg-ink px-3 py-2 text-xs text-cream focus:border-crimson focus:outline-none"
              />
              {dateFilter && (
                <button
                  onClick={() => setDateFilter("")}
                  className="text-[10px] text-stone hover:text-cream underline cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Cards Grid */}
          {filteredBookings.length === 0 ? (
            <div className="border border-dashed border-white/15 bg-coal/50 p-12 text-center text-stone">
              <CalendarCheck2 className="mx-auto h-10 w-10 text-stone/40 mb-3" />
              <p className="text-sm font-medium text-cream">No reservations match your filters</p>
              <p className="text-xs text-stone mt-1">Try adjusting your date or status selection.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBookings.map((b) => {
                const conf = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
                return (
                  <div
                    key={b.id}
                    className="border border-white/10 bg-coal p-5 flex flex-col justify-between hover:border-white/25 transition-all"
                  >
                    <div>
                      {/* Card Header: Guest & Status Badge */}
                      <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
                        <div>
                          <h3 className="font-display text-base font-bold text-cream">
                            {b.customerName || b.name}
                          </h3>
                          <span className="text-[10px] text-stone tracking-wide">
                            {b.partySize} {b.partySize === 1 ? "Guest" : "Guests"}
                            {b.tableNumber && (
                              <span className="ml-2 font-semibold text-crimson-bright">
                                · Table {b.tableNumber}
                              </span>
                            )}
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${conf.bg} ${conf.text} ${conf.border}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${conf.dot}`} />
                          {conf.label}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="mt-3.5 space-y-2 text-xs text-stone">
                        <div className="flex items-center gap-2 text-cream">
                          <Clock className="h-3.5 w-3.5 text-crimson-bright shrink-0" />
                          <span className="font-medium">
                            {b.date} at {b.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-stone shrink-0" />
                          <a
                            href={`tel:${b.phone}`}
                            className="hover:text-cream transition-colors"
                          >
                            {b.phone || "No phone provided"}
                          </a>
                        </div>
                        {b.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-stone shrink-0" />
                            <a
                              href={`mailto:${b.email}`}
                              className="hover:text-cream transition-colors truncate"
                            >
                              {b.email}
                            </a>
                          </div>
                        )}
                        {b.notes && (
                          <div className="mt-2.5 rounded bg-ink/70 p-2 text-[11px] text-stone italic border border-white/5">
                            "{b.notes}"
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="mt-5 border-t border-white/10 pt-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {b.status !== "confirmed" && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, "confirmed")}
                            title="Accept Reservation"
                            className="inline-flex items-center gap-1 bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-cream px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            <Check className="h-3 w-3" />
                            Accept
                          </button>
                        )}
                        {b.status !== "declined" && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, "declined")}
                            title="Decline Reservation"
                            className="inline-flex items-center gap-1 bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 text-rose-300 hover:text-cream px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            <X className="h-3 w-3" />
                            Decline
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModalFor(b)}
                          title="Reschedule or Edit Table"
                          className="p-1.5 text-stone hover:text-cream hover:bg-white/10 rounded transition-colors cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBooking(b.id)}
                          title="Delete Reservation"
                          className="p-1.5 text-stone hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: CALENDAR VIEW */}
      {viewMode === "calendar" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left 2 Cols: Month Calendar Grid */}
          <div className="border border-white/10 bg-coal p-6 lg:col-span-2 space-y-4">
            {/* Month Header Navigation */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="font-display text-lg font-bold text-cream">
                {format(currentCalendarMonth, "MMMM yyyy")}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentCalendarMonth(subMonths(currentCalendarMonth, 1))}
                  className="p-1.5 text-stone hover:text-cream hover:bg-white/10 rounded transition-colors cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setCurrentCalendarMonth(new Date());
                    setSelectedDay(new Date());
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-stone hover:text-cream border border-white/15 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Today
                </button>
                <button
                  onClick={() => setCurrentCalendarMonth(addMonths(currentCalendarMonth, 1))}
                  className="p-1.5 text-stone hover:text-cream hover:bg-white/10 rounded transition-colors cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Weekdays Header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-widest text-stone">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w) => (
                <div key={w} className="py-2">
                  {w}
                </div>
              ))}
            </div>

            {/* Month Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day) => {
                const dayStr = format(day, "yyyy-MM-dd");
                const dayBookings = bookings.filter((b) => b.date === dayStr);
                const dayBlocked = blockedSlots.filter((s) => s.date === dayStr);
                const isSelected = isSameDay(day, selectedDay);
                const isCurrentMonth = isSameMonth(day, currentCalendarMonth);

                return (
                  <div
                    key={dayStr}
                    onClick={() => setSelectedDay(day)}
                    className={`min-h-[76px] p-2 border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "border-crimson bg-crimson/10 shadow-[inset_0_0_0_1px_rgba(200,16,46,0.6)]"
                        : "border-white/5 bg-ink/50 hover:border-white/20 hover:bg-ink/80"
                    } ${!isCurrentMonth ? "opacity-35" : "opacity-100"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-semibold tabular-nums ${
                          isSameDay(day, new Date())
                            ? "flex h-5 w-5 items-center justify-center rounded-full bg-crimson text-cream font-bold"
                            : "text-cream/90"
                        }`}
                      >
                        {format(day, "d")}
                      </span>
                      {dayBlocked.length > 0 && (
                        <span title="Blocked slot active" className="h-2 w-2 rounded-full bg-rose-500" />
                      )}
                    </div>

                    {/* Indicators */}
                    <div className="mt-1 space-y-1">
                      {dayBookings.slice(0, 2).map((bk) => (
                        <div
                          key={bk.id}
                          className={`truncate rounded px-1 py-0.5 text-[9px] font-medium ${
                            bk.status === "confirmed"
                              ? "bg-emerald-950/70 text-emerald-300 border border-emerald-500/30"
                              : bk.status === "pending"
                              ? "bg-amber-950/70 text-amber-300 border border-amber-500/30"
                              : "bg-stone-900 text-stone-400"
                          }`}
                        >
                          {bk.time} {bk.customerName || bk.name}
                        </div>
                      ))}
                      {dayBookings.length > 2 && (
                        <span className="text-[9px] text-stone font-semibold block">
                          +{dayBookings.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Col: Selected Day Schedule / Details */}
          <div className="border border-white/10 bg-coal p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-crimson-bright block">
                  Day Schedule
                </span>
                <h3 className="font-display text-lg font-bold text-cream">
                  {format(selectedDay, "EEEE, MMM d, yyyy")}
                </h3>
              </div>
              <button
                onClick={() => {
                  setBlockSlotData({
                    date: selectedDayFormatted,
                    time: "all-day",
                    reason: "Private Event / Full Capacity",
                  });
                  setBlockModalOpen(true);
                }}
                className="text-[10px] uppercase tracking-wider font-semibold text-rose-400 hover:text-rose-300 border border-rose-500/30 px-2.5 py-1 transition-colors cursor-pointer"
              >
                + Block Day
              </button>
            </div>

            {/* Blocked Slots for this day */}
            {selectedDayBlocked.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-400 block">
                  Blocked Slots on this Date:
                </span>
                {selectedDayBlocked.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between border border-rose-500/30 bg-rose-950/30 p-2.5 text-xs text-rose-200"
                  >
                    <div>
                      <span className="font-bold uppercase tracking-wide">
                        {slot.time === "all-day" ? "All Day Blocked" : slot.time}
                      </span>
                      <p className="text-[11px] text-rose-300/80">{slot.reason}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteBlockedSlot(slot.id)}
                      className="p-1 text-rose-400 hover:text-rose-100 transition-colors cursor-pointer"
                      title="Unblock slot"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Bookings for selected date */}
            <div className="space-y-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-stone block">
                Reservations ({selectedDayBookings.length}):
              </span>

              {selectedDayBookings.length === 0 ? (
                <div className="py-8 text-center text-xs text-stone">
                  No reservations booked for this day yet.
                </div>
              ) : (
                selectedDayBookings.map((b) => {
                  const conf = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
                  return (
                    <div
                      key={b.id}
                      className="border border-white/10 bg-ink p-3 space-y-2.5 hover:border-white/20 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-xs font-bold text-cream block">
                            {b.customerName || b.name}
                          </span>
                          <span className="text-[10px] text-stone">
                            {b.time} · {b.partySize} Guests {b.tableNumber ? `· Table ${b.tableNumber}` : ""}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${conf.bg} ${conf.text} ${conf.border}`}
                        >
                          {conf.label}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 text-xs text-stone border-t border-white/5 pt-2">
                        <span className="text-[10px]">{b.phone}</span>
                        <div className="flex items-center gap-1.5">
                          {b.status !== "confirmed" && (
                            <button
                              onClick={() => handleUpdateStatus(b.id, "confirmed")}
                              className="text-[10px] font-bold text-emerald-400 hover:underline cursor-pointer"
                            >
                              Accept
                            </button>
                          )}
                          {b.status !== "declined" && (
                            <button
                              onClick={() => handleUpdateStatus(b.id, "declined")}
                              className="text-[10px] font-bold text-rose-400 hover:underline cursor-pointer"
                            >
                              Decline
                            </button>
                          )}
                          <button
                            onClick={() => openEditModalFor(b)}
                            className="text-[10px] text-stone hover:text-cream cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RESCHEDULE / EDIT RESERVATION */}
      {editModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-lg border border-white/15 bg-coal p-6 text-cream shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-display text-lg font-bold">Manage Reservation</h3>
                <p className="text-xs text-stone">
                  {selectedBooking.customerName || selectedBooking.name} ({selectedBooking.phone})
                </p>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-stone hover:text-cream transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-stone block">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editFormData.date}
                    onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                    className="w-full border border-white/15 bg-ink px-3 py-2 text-xs text-cream focus:border-crimson focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-stone block">
                    Time Slot
                  </label>
                  <select
                    value={editFormData.time}
                    onChange={(e) => setEditFormData({ ...editFormData, time: e.target.value })}
                    className="w-full border border-white/15 bg-ink px-3 py-2 text-xs text-cream focus:border-crimson focus:outline-none"
                  >
                    {STANDARD_TIMES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-stone block">
                    Party Size
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={editFormData.partySize}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, partySize: Number(e.target.value) })
                    }
                    className="w-full border border-white/15 bg-ink px-3 py-2 text-xs text-cream focus:border-crimson focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-stone block">
                    Assigned Table #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Table 4 / Red Booth"
                    value={editFormData.tableNumber}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, tableNumber: e.target.value })
                    }
                    className="w-full border border-white/15 bg-ink px-3 py-2 text-xs text-cream focus:border-crimson focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-stone block">
                  Status
                </label>
                <select
                  value={editFormData.status}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, status: e.target.value as BookingStatus })
                  }
                  className="w-full border border-white/15 bg-ink px-3 py-2 text-xs text-cream focus:border-crimson focus:outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="declined">Declined</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-stone block">
                  Guest Notes & Requests
                </label>
                <textarea
                  rows={3}
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  placeholder="Anniversary, high chair, window seating..."
                  className="w-full border border-white/15 bg-ink px-3 py-2 text-xs text-cream focus:border-crimson focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => handleDeleteBooking(selectedBooking.id)}
                  className="text-xs font-semibold text-rose-400 hover:text-rose-300 hover:underline cursor-pointer"
                >
                  Delete Booking
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="border border-white/15 px-4 py-2 text-xs uppercase tracking-wider text-stone hover:text-cream cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-crimson hover:bg-crimson-bright px-5 py-2 text-xs font-bold uppercase tracking-wider text-cream transition-colors cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BLOCK A SLOT */}
      {blockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md border border-white/15 bg-coal p-6 text-cream shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-rose-400">
                <Ban className="h-4 w-4" />
                <h3 className="font-display text-base font-bold text-cream">Block Time Slot</h3>
              </div>
              <button
                onClick={() => setBlockModalOpen(false)}
                className="text-stone hover:text-cream transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBlockedSlot} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-stone block">
                  Date to Block
                </label>
                <input
                  type="date"
                  required
                  value={blockSlotData.date}
                  onChange={(e) => setBlockSlotData({ ...blockSlotData, date: e.target.value })}
                  className="w-full border border-white/15 bg-ink px-3 py-2 text-xs text-cream focus:border-crimson focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-stone block">
                  Slot Time
                </label>
                <select
                  value={blockSlotData.time}
                  onChange={(e) => setBlockSlotData({ ...blockSlotData, time: e.target.value })}
                  className="w-full border border-white/15 bg-ink px-3 py-2 text-xs text-cream focus:border-crimson focus:outline-none"
                >
                  <option value="all-day">All Day (Complete Restaurant Block)</option>
                  {STANDARD_TIMES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-stone block">
                  Reason for Block
                </label>
                <input
                  type="text"
                  required
                  value={blockSlotData.reason}
                  onChange={(e) => setBlockSlotData({ ...blockSlotData, reason: e.target.value })}
                  placeholder="e.g. Private corporate event, kitchen deep clean, Holiday closure"
                  className="w-full border border-white/15 bg-ink px-3 py-2 text-xs text-cream focus:border-crimson focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setBlockModalOpen(false)}
                  className="border border-white/15 px-4 py-2 text-xs uppercase tracking-wider text-stone hover:text-cream cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-rose-700 hover:bg-rose-600 px-5 py-2 text-xs font-bold uppercase tracking-wider text-cream transition-colors cursor-pointer"
                >
                  Block This Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
