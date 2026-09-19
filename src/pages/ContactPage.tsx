import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Reveal from "../components/Reveal";
import { ADDRESS, PHONE, EMAIL, HOURS } from "../data/content";
import { useSiteContent } from "../services/firestoreData";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  Train,
  Car,
  CalendarCheck2,
} from "lucide-react";

export default function ContactPage() {
  const { content } = useSiteContent();
  const [formSent, setFormSent] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    message: "",
  });

  useEffect(() => {
    document.title = "Contact & Visit Us — 429 Yonge St, Toronto | ARJU";
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSent(true);
    setTimeout(() => {
      setFormData({ name: "", email: "", phone: "", subject: "General Inquiry", message: "" });
    }, 1000);
  };

  const phoneDisplay = content.contactInfo?.phone || PHONE;
  const emailDisplay = content.contactInfo?.email || EMAIL;
  const addressDisplay = content.contactInfo?.address || ADDRESS;

  return (
    <div className="pt-28 pb-20 bg-ink text-cream">
      {/* Page Header */}
      <section className="relative px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto text-center border-b border-white/10 pb-16">
        <Reveal>
          <div className="flex items-center justify-center gap-3 text-crimson-bright mb-3">
            <span className="h-px w-8 bg-crimson" />
            <span className="text-[11px] tracking-[0.35em] uppercase font-semibold">
              Visit Downtown Toronto
            </span>
            <span className="h-px w-8 bg-crimson" />
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-cream">
            Contact & Directions
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-stone text-sm sm:text-base leading-relaxed">
            We are situated in the energetic heart of Toronto on Yonge Street, steps away from
            College Subway Station and TMU.
          </p>
        </Reveal>
      </section>

      <div className="px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Left: Contact Info & Hours Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Primary Details */}
            <div className="border border-white/10 bg-coal p-6 sm:p-8 space-y-6">
              <h2 className="font-display text-xl font-bold text-cream">Restaurant Information</h2>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-crimson-bright shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-cream block text-sm">Street Address</span>
                    <p className="text-stone mt-0.5">{addressDisplay}</p>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(addressDisplay)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-crimson-bright hover:underline inline-block mt-1 font-medium"
                    >
                      Open in Google Maps →
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-crimson-bright shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-cream block text-sm">Phone Number</span>
                    <a
                      href={`tel:${phoneDisplay.replace(/[^0-9]/g, "")}`}
                      className="text-stone hover:text-cream block mt-0.5 text-sm"
                    >
                      {phoneDisplay}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-crimson-bright shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-cream block text-sm">Email Inquiries</span>
                    <a
                      href={`mailto:${emailDisplay}`}
                      className="text-stone hover:text-cream block mt-0.5 text-sm"
                    >
                      {emailDisplay}
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <Link
                  to="/booking"
                  className="w-full inline-flex items-center justify-center gap-2 bg-crimson hover:bg-crimson-bright py-3 text-xs font-bold uppercase tracking-widest text-cream transition-colors"
                >
                  <CalendarCheck2 className="h-4 w-4" /> Book a Table Online
                </Link>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="border border-white/10 bg-coal p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2 text-crimson-bright">
                <Clock className="h-5 w-5" />
                <h3 className="font-display text-lg font-bold text-cream">Hours of Operation</h3>
              </div>

              <div className="divide-y divide-white/5 text-xs">
                {HOURS.map((h, i) => (
                  <div key={i} className="flex justify-between py-2 text-stone">
                    <span className="font-medium">{h.day}</span>
                    <span className="text-cream">{h.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Transit Directions */}
            <div className="border border-white/10 bg-coal p-6 sm:p-8 space-y-4">
              <h3 className="font-display text-base font-bold text-cream">Public Transit & Parking</h3>
              <div className="space-y-3 text-xs text-stone leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <Train className="h-4 w-4 text-crimson-bright shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-cream block">Subway (Line 1):</strong>
                    Exit at College Station, walk 2 minutes north along Yonge St.
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Car className="h-4 w-4 text-crimson-bright shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-cream block">Parking:</strong>
                    Public parking at 400 Yonge St (College Park Green P garage) and on-street
                    parking along Granby & Carlton.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Interactive Map Embed + Contact Form (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Interactive Map Embed */}
            <div className="border border-white/10 bg-coal overflow-hidden h-72 sm:h-80 w-full relative">
              <iframe
                title="ARJU Location Map"
                src="https://maps.google.com/maps?q=429+Yonge+St+%23102,+Toronto,+ON+M5B+1T1,+Canada&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "grayscale(25%) contrast(1.1)" }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Direct Message Form */}
            <div className="border border-white/10 bg-coal p-6 sm:p-10 space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-cream">Send Us a Note</h2>
                <p className="mt-1 text-xs text-stone">
                  Catering requests, feedback, or general questions—our team responds within 24
                  hours.
                </p>
              </div>

              {formSent ? (
                <div className="border border-emerald-500/40 bg-emerald-950/40 p-6 text-center space-y-3">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400" />
                  <h3 className="font-display text-lg font-bold text-cream">
                    Thank you for reaching out!
                  </h3>
                  <p className="text-xs text-stone">
                    Your message has been sent to our management team. We will be in touch shortly.
                  </p>
                  <button
                    onClick={() => setFormSent(false)}
                    className="mt-2 text-xs text-crimson-bright underline cursor-pointer"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-stone block">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full border border-white/15 bg-ink px-4 py-2.5 text-xs text-cream placeholder-stone/50 focus:border-crimson focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-stone block">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full border border-white/15 bg-ink px-4 py-2.5 text-xs text-cream placeholder-stone/50 focus:border-crimson focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-stone block">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(647) 531-4715"
                        className="w-full border border-white/15 bg-ink px-4 py-2.5 text-xs text-cream placeholder-stone/50 focus:border-crimson focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-stone block">
                        Subject
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full border border-white/15 bg-ink px-4 py-2.5 text-xs text-cream focus:border-crimson focus:outline-none"
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Catering & Large Orders">Catering & Large Orders</option>
                        <option value="Private Dining & Events">Private Dining & Events</option>
                        <option value="Feedback & Press">Feedback & Press</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-stone block">
                      Your Message *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="How can our hospitality team assist you?"
                      className="w-full border border-white/15 bg-ink px-4 py-2.5 text-xs text-cream placeholder-stone/50 focus:border-crimson focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 bg-crimson hover:bg-crimson-bright px-8 py-3 text-xs font-bold uppercase tracking-widest text-cream transition-colors cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" /> Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
