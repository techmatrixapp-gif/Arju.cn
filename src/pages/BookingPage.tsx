import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Reveal from "../components/Reveal";
import {
  createReservationBooking,
  useBlockedSlots,
  useBookings,
  useSettings,
} from "../services/firestoreData";
import { ADDRESS, PHONE, EMAIL, HOURS } from "../data/content";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  PhoneCall,
  Mail,
  Compass,
  Car,
  Train,
  Sparkles,
} from "lucide-react";
import { format, addDays } from "date-fns";

const TIME_SLOTS = [
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

export default function BookingPage() {
  const { settings } = useSettings();
  const activeAddress = settings.address || ADDRESS;
  const activePhone = settings.phone || PHONE;
  const activeEmail = settings.email || EMAIL;
  const activeHours = settings.storeHours?.length ? settings.storeHours : HOURS;
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const maxDateStr = format(addDays(new Date(), 60), "yyyy-MM-dd");

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedTime, setSelectedTime] = useState<string>("18:30");
  const [partySize, setPartySize] = useState<number>(2);

  // Form inputs
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<{
    id: string;
    customerName: string;
    date: string;
    time: string;
    partySize: number;
  } | null>(null);

  // Real-time hooks for selected date
  const { blockedSlots } = useBlockedSlots(selectedDate);
  const { bookings: existingBookings } = useBookings(selectedDate);

  useEffect(() => {
    document.title = "Reservations — Book a Table at ARJU | 429 Yonge St, Toronto";
  }, []);

  // Compute unavailable slots for selected date
  const slotAvailability = useMemo(() => {
    // Check if whole day is blocked
    const allDayBlocked = blockedSlots.some(
      (b) => b.date === selectedDate && (b.time === "all-day" || !b.time)
    );

    const map: Record<string, { available: boolean; reason?: string }> = {};

    TIME_SLOTS.forEach((time) => {
      if (allDayBlocked) {
        map[time] = { available: false, reason: "Restaurant closed for private event" };
        return;
      }

      // Check specific slot block
      const isSpecificBlocked = blockedSlots.some(
        (b) => b.date === selectedDate && b.time === time
      );
      if (isSpecificBlocked) {
        map[time] = { available: false, reason: "Slot fully booked or reserved" };
        return;
      }

      // Check capacity limit (< 4 active bookings per slot)
      const count = existingBookings.filter(
        (b) =>
          b.date === selectedDate &&
          b.time === time &&
          (b.status === "pending" || b.status === "confirmed")
      ).length;

      if (count >= 4) {
        map[time] = { available: false, reason: "Fully Booked" };
      } else {
        map[time] = { available: true };
      }
    });

    return map;
  }, [blockedSlots, existingBookings, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Double check availability client side first
    const avail = slotAvailability[selectedTime];
    if (avail && !avail.available) {
      setErrorMessage("This time slot is no longer available. Please select an alternate time.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createReservationBooking({
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        partySize,
        date: selectedDate,
        time: selectedTime,
        notes: notes.trim(),
      });

      if (!result.success) {
        setErrorMessage(result.message);
        setSubmitting(false);
        return;
      }

      setConfirmedBooking({
        id: result.id || `ARJU-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: customerName.trim(),
        date: selectedDate,
        time: selectedTime,
        partySize,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error("Booking error:", err);
      setErrorMessage(err?.message || "Failed to submit reservation. Please call us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-28 pb-20 bg-ink text-cream">
      {/* Header */}
      <section className="relative px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto text-center border-b border-white/10 pb-14">
        <Reveal>
          <div className="flex items-center justify-center gap-3 text-crimson-bright mb-3">
            <span className="h-px w-8 bg-crimson" />
            <span className="text-[11px] tracking-[0.35em] uppercase font-semibold">
              Instant Table Booking
            </span>
            <span className="h-px w-8 bg-crimson" />
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-cream">
            Reserve Your Table
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-stone text-sm sm:text-base leading-relaxed">
            Join us for an unforgettable evening of handcrafted Halal cuisine in Downtown Toronto.
            Select your preferred date and seating time below.
          </p>
        </Reveal>
      </section>

      <div className="px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto py-16">
        {/* SUCCESS CONFIRMATION SCREEN */}
        {confirmedBooking ? (
          <div className="max-w-2xl mx-auto border border-emerald-500/40 bg-coal p-8 sm:p-12 text-center space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold block mb-1">
                Reservation Confirmed
              </span>
              <h2 className="font-display text-3xl font-bold text-cream">
                We Look Forward to Welcoming You, {confirmedBooking.customerName}!
              </h2>
            </div>

            <div className="border border-white/10 bg-ink/70 p-6 text-left space-y-3">
              <div className="flex justify-between text-xs text-stone border-b border-white/10 pb-2">
                <span>Confirmation Ref:</span>
                <span className="font-mono font-bold text-cream">{confirmedBooking.id}</span>
              </div>
              <div className="flex justify-between text-xs text-stone border-b border-white/10 pb-2">
                <span>Date & Time:</span>
                <span className="font-bold text-cream">
                  {confirmedBooking.date} at {confirmedBooking.time}
                </span>
              </div>
              <div className="flex justify-between text-xs text-stone border-b border-white/10 pb-2">
                <span>Party Size:</span>
                <span className="font-bold text-cream">
                  {confirmedBooking.partySize} {confirmedBooking.partySize === 1 ? "Guest" : "Guests"}
                </span>
              </div>
              <div className="flex justify-between text-xs text-stone">
                <span>Location:</span>
                <span className="font-bold text-cream text-right">
                  429 Yonge St #102, Toronto
                </span>
              </div>
            </div>

            <p className="text-xs text-stone leading-relaxed">
              A copy of your reservation request has been submitted to our dining room hosts. If you
              need to modify or cancel your booking, please call us at{" "}
              <a href={`tel:${PHONE.replace(/[^0-9]/g, "")}`} className="text-crimson-bright underline">
                {PHONE}
              </a>
              .
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/menu"
                className="bg-crimson hover:bg-crimson-bright px-6 py-3 text-xs font-semibold tracking-widest uppercase text-cream transition-colors"
              >
                Browse Our Menu
              </Link>
              <button
                onClick={() => setConfirmedBooking(null)}
                className="border border-white/20 hover:border-white/40 px-6 py-3 text-xs font-semibold tracking-widest uppercase text-stone hover:text-cream transition-colors cursor-pointer"
              >
                Book Another Table
              </button>
            </div>
          </div>
        ) : (
          /* RESERVATION FORM & VISIT DETAILS GRID */
          <div className="grid gap-12 lg:grid-cols-12">
            {/* Left: Interactive Booking Form (7 cols) */}
            <div className="lg:col-span-7 border border-white/10 bg-coal p-6 sm:p-10 space-y-8">
              <div>
                <div className="flex items-center gap-2 text-crimson-bright mb-1">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-[10px] uppercase tracking-[0.28em] font-semibold">
                    Real-time Availability
                  </span>
                </div>
                <h2 className="font-display text-2xl font-bold text-cream">Select Date & Time</h2>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-3 border border-rose-500/40 bg-rose-950/40 px-4 py-3 text-xs text-rose-300">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 1: Date & Party Size */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-stone block">
                      Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        min={todayStr}
                        max={maxDateStr}
                        required
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full border border-white/15 bg-ink px-4 py-3 text-sm text-cream focus:border-crimson focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-stone block">
                      Number of Guests
                    </label>
                    <select
                      value={partySize}
                      onChange={(e) => setPartySize(Number(e.target.value))}
                      className="w-full border border-white/15 bg-ink px-4 py-3 text-sm text-cream focus:border-crimson focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 20].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? "Guest" : "Guests"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Step 2: Time Slot Pills */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold uppercase tracking-wider text-stone block">
                    Available Seating Times for {selectedDate}:
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {TIME_SLOTS.map((time) => {
                      const avail = slotAvailability[time] ?? { available: true };
                      const isSelected = selectedTime === time && avail.available;

                      return (
                        <button
                          key={time}
                          type="button"
                          disabled={!avail.available}
                          onClick={() => setSelectedTime(time)}
                          className={`px-3 py-2.5 text-xs font-semibold tracking-wider transition-all border text-center ${
                            !avail.available
                              ? "border-white/5 bg-ink/30 text-stone/40 line-through cursor-not-allowed"
                              : isSelected
                              ? "border-crimson bg-crimson text-cream shadow-sm"
                              : "border-white/15 bg-ink hover:border-crimson/50 hover:bg-white/5 text-cream cursor-pointer"
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 3: Guest Details */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <span className="text-xs font-semibold uppercase tracking-wider text-crimson-bright block">
                    Guest Information
                  </span>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-stone block">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full border border-white/15 bg-ink px-4 py-3 text-sm text-cream placeholder-stone/50 focus:border-crimson focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-stone block">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(647) 531-4715"
                        className="w-full border border-white/15 bg-ink px-4 py-3 text-sm text-cream placeholder-stone/50 focus:border-crimson focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-stone block">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full border border-white/15 bg-ink px-4 py-3 text-sm text-cream placeholder-stone/50 focus:border-crimson focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-stone block">
                        Special Requests or Dietary Notes
                      </label>
                      <textarea
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Birthday, anniversary, high chair, spice preferences, or accessibility accommodations..."
                        className="w-full border border-white/15 bg-ink px-4 py-3 text-sm text-cream placeholder-stone/50 focus:border-crimson focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-crimson hover:bg-crimson-bright py-4 text-xs font-bold uppercase tracking-[0.24em] text-cream transition-all shadow-lg hover:shadow-crimson/25 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Checking Availability & Reserving..." : `Confirm Table for ${partySize} on ${selectedDate} at ${selectedTime}`}
                </button>
              </form>
            </div>

            {/* Right: Hours, Location & Directions (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Location Card */}
              <div className="border border-white/10 bg-coal p-6 sm:p-8 space-y-5">
                <div className="flex items-center gap-2 text-crimson-bright">
                  <MapPin className="h-5 w-5" />
                  <h3 className="font-display text-lg font-bold text-cream">Restaurant Location</h3>
                </div>

                <div>
                  <p className="text-sm font-semibold text-cream">{activeAddress}</p>
                  <p className="mt-1 text-xs text-stone">
                    Located on Yonge Street between College and Carlton, steps from College Subway
                    Station.
                  </p>
                </div>

                <div className="space-y-2 border-t border-white/10 pt-4 text-xs">
                  <div className="flex items-center gap-2 text-stone">
                    <PhoneCall className="h-4 w-4 text-crimson-bright" />
                    <a href={`tel:${activePhone.replace(/[^0-9]/g, "")}`} className="hover:text-cream">
                      {activePhone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-stone">
                    <Mail className="h-4 w-4 text-crimson-bright" />
                    <a href={`mailto:${activeEmail}`} className="hover:text-cream">
                      {activeEmail}
                    </a>
                  </div>
                </div>
              </div>

              {/* Operating Hours Card */}
              <div className="border border-white/10 bg-coal p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-2 text-crimson-bright">
                  <Clock className="h-5 w-5" />
                  <h3 className="font-display text-lg font-bold text-cream">Dining Room Hours</h3>
                </div>

                <div className="divide-y divide-white/5 text-xs">
                  {activeHours.map((h, i) => (
                    <div key={i} className="flex justify-between py-2 text-stone">
                      <span className="font-medium">{h.day}</span>
                      <span className="text-cream">{h.hours}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transit & Parking Guidance */}
              <div className="border border-white/10 bg-coal p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-2 text-crimson-bright">
                  <Compass className="h-5 w-5" />
                  <h3 className="font-display text-lg font-bold text-cream">Getting Here</h3>
                </div>

                <div className="space-y-3 text-xs text-stone leading-relaxed">
                  <div className="flex items-start gap-2.5">
                    <Train className="h-4 w-4 text-crimson-bright shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-cream block">By TTC Subway:</span>
                      Take Line 1 (Yonge-University) to College Station. Walk 2 minutes north on
                      Yonge St to #429.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Car className="h-4 w-4 text-crimson-bright shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-cream block">Parking:</span>
                      Street parking available along Carlton and Granby St. Underground Green P
                      parking garage situated at 400 Yonge St (College Park).
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
