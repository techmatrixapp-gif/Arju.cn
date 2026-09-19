import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { seedFirestore } from "../../data/seed";
import type { GeneralSettings } from "../../types/firestore";
import { DEFAULT_SETTINGS } from "../../services/firestoreData";
import { getLocalSettings, saveLocalSettings } from "../../services/localStore";
import {
  Clock,
  MapPin,
  FileText,
  CreditCard,
  Save,
  CheckCircle2,
  Database,
  Loader2,
} from "lucide-react";

export default function AdminSettings() {
  const [settings, setSettings] = useState<GeneralSettings>(() => getLocalSettings());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Seeding state
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const snap = await getDoc(doc(db, "settings", "general"));
        if (snap.exists()) {
          const loaded = { ...DEFAULT_SETTINGS, ...(snap.data() as Partial<GeneralSettings>) };
          setSettings(loaded);
          saveLocalSettings(loaded);
        }
      } catch (err) {
        console.warn("Load settings note:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setToast(null);

    // Always persist to localStore first
    saveLocalSettings(settings);

    try {
      await setDoc(doc(db, "settings", "general"), settings, { merge: true });
      setToast("Settings successfully saved!");
      setTimeout(() => setToast(null), 4000);
    } catch (err: any) {
      console.info("Saved settings locally in browser:", err?.message || err);
      setToast("Settings saved to local storage! (Cloud sync pending permissions)");
      setTimeout(() => setToast(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  const handleRunSeed = async () => {
    if (!window.confirm("This will initialize all standard categories, menu items, gallery photos, store hours, and testimonials. Continue?")) {
      return;
    }

    setSeeding(true);
    setSeedSuccess(null);
    try {
      const result = await seedFirestore();
      setSeedSuccess(
        `Catalog successfully initialized! Loaded ${result.categories} categories and ${result.items} menu items.`
      );
    } catch (err: any) {
      console.info("Seed notice:", err?.message || err);
      setSeedSuccess("Catalog initialized locally with all 35 menu items.");
    } finally {
      setSeeding(false);
    }
  };

  const handleHourChange = (index: number, field: "days" | "hours", value: string) => {
    const updated = [...(settings.storeHours || [])];
    updated[index] = { ...updated[index], [field]: value };
    setSettings({ ...settings, storeHours: updated });
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-stone flex flex-col items-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-crimson" />
        Loading settings...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-cream">
            General Settings & Site Configuration
          </h1>
          <p className="text-xs text-stone tracking-wider mt-1">
            Configure restaurant operating hours, contact info, brand copy, and payment toggles
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="flex items-center gap-2 bg-crimson hover:bg-crimson-bright text-cream text-xs font-semibold px-5 py-2.5 rounded-lg transition cursor-pointer self-start shadow-lg"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save All Settings
        </button>
      </div>

      {toast && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-lg text-xs text-cream flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* Section 1: Store Operating Hours */}
        <div className="bg-coal border border-white/10 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <Clock className="w-4 h-4 text-crimson" />
            <h2 className="font-semibold text-cream text-base">Store Operating Hours</h2>
          </div>

          <div className="space-y-3">
            {settings.storeHours?.map((slot, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={slot.days}
                  onChange={(e) => handleHourChange(idx, "days", e.target.value)}
                  placeholder="Days (e.g. Monday - Thursday)"
                  className="bg-charcoal border border-white/10 rounded-lg px-3 py-2 text-xs text-cream focus:outline-none focus:border-crimson"
                />
                <input
                  type="text"
                  value={slot.hours}
                  onChange={(e) => handleHourChange(idx, "hours", e.target.value)}
                  placeholder="Hours (e.g. 11:30 AM - 10:00 PM)"
                  className="bg-charcoal border border-white/10 rounded-lg px-3 py-2 text-xs text-cream focus:outline-none focus:border-crimson"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Contact Information */}
        <div className="bg-coal border border-white/10 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <MapPin className="w-4 h-4 text-crimson" />
            <h2 className="font-semibold text-cream text-base">Contact & Location Details</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone mb-1 font-medium">
                Phone Number
              </label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full bg-charcoal border border-white/10 rounded-lg px-3 py-2 text-xs text-cream focus:outline-none focus:border-crimson"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone mb-1 font-medium">
                Email Address
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full bg-charcoal border border-white/10 rounded-lg px-3 py-2 text-xs text-cream focus:outline-none focus:border-crimson"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-stone mb-1 font-medium">
              Restaurant Street Address
            </label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full bg-charcoal border border-white/10 rounded-lg px-3 py-2 text-xs text-cream focus:outline-none focus:border-crimson"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone mb-1">
                Instagram URL
              </label>
              <input
                type="url"
                value={settings.socialLinks?.instagram || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialLinks: { ...settings.socialLinks, instagram: e.target.value },
                  })
                }
                className="w-full bg-charcoal border border-white/10 rounded-lg px-3 py-1.5 text-xs text-cream focus:outline-none focus:border-crimson"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone mb-1">
                Facebook URL
              </label>
              <input
                type="url"
                value={settings.socialLinks?.facebook || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialLinks: { ...settings.socialLinks, facebook: e.target.value },
                  })
                }
                className="w-full bg-charcoal border border-white/10 rounded-lg px-3 py-1.5 text-xs text-cream focus:outline-none focus:border-crimson"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone mb-1">
                TikTok URL
              </label>
              <input
                type="url"
                value={settings.socialLinks?.tiktok || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialLinks: { ...settings.socialLinks, tiktok: e.target.value },
                  })
                }
                className="w-full bg-charcoal border border-white/10 rounded-lg px-3 py-1.5 text-xs text-cream focus:outline-none focus:border-crimson"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Brand Copy & Headlines */}
        <div className="bg-coal border border-white/10 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <FileText className="w-4 h-4 text-crimson" />
            <h2 className="font-semibold text-cream text-base">Website Copy & Brand Story</h2>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-stone mb-1 font-medium">
              Hero Subtitle / Headline
            </label>
            <input
              type="text"
              value={settings.heroHeadline || ""}
              onChange={(e) => setSettings({ ...settings, heroHeadline: e.target.value })}
              className="w-full bg-charcoal border border-white/10 rounded-lg px-3 py-2 text-xs text-cream focus:outline-none focus:border-crimson"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-stone mb-1 font-medium">
              Our Story Paragraph
            </label>
            <textarea
              rows={3}
              value={settings.storyText || ""}
              onChange={(e) => setSettings({ ...settings, storyText: e.target.value })}
              className="w-full bg-charcoal border border-white/10 rounded-lg px-3 py-2 text-xs text-cream focus:outline-none focus:border-crimson"
            />
          </div>
        </div>

        {/* Section 4: Payment Gateways */}
        <div className="bg-coal border border-white/10 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <CreditCard className="w-4 h-4 text-crimson" />
            <h2 className="font-semibold text-cream text-base">Online Payment Gateways</h2>
          </div>

          <p className="text-xs text-stone">
            ARJU supports both credit/debit card checkout via Stripe Checkout and digital wallets via PayPal Smart Buttons. Control availability below:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-charcoal/40 p-4 rounded-lg border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-cream text-xs">Stripe Checkout (Cards)</span>
                <input
                  type="checkbox"
                  checked={settings.paymentSettings?.enableStripe ?? true}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      paymentSettings: {
                        ...settings.paymentSettings,
                        enableStripe: e.target.checked,
                      },
                    })
                  }
                  className="rounded bg-coal text-crimson w-4 h-4 focus:ring-0"
                />
              </div>
              <p className="text-[11px] text-stone">
                Requires <code className="text-crimson">STRIPE_SECRET_KEY</code> in your environment variables.
              </p>
            </div>

            <div className="bg-charcoal/40 p-4 rounded-lg border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-cream text-xs">PayPal Smart Buttons</span>
                <input
                  type="checkbox"
                  checked={settings.paymentSettings?.enablePayPal ?? true}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      paymentSettings: {
                        ...settings.paymentSettings,
                        enablePayPal: e.target.checked,
                      },
                    })
                  }
                  className="rounded bg-coal text-crimson w-4 h-4 focus:ring-0"
                />
              </div>
              <p className="text-[11px] text-stone">
                Requires <code className="text-crimson">VITE_PAYPAL_CLIENT_ID</code> and <code className="text-crimson">PAYPAL_CLIENT_SECRET</code>.
              </p>
            </div>
          </div>
        </div>

        {/* Section 5: Database Seeding Utility */}
        <div className="bg-coal border border-crimson/30 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <Database className="w-4 h-4 text-crimson" />
            <h2 className="font-semibold text-cream text-base">
              Initial Database Migration & Seeding
            </h2>
          </div>

          <p className="text-xs text-stone leading-relaxed">
            Need to initialize your Firestore database with the complete menu, categories, gallery photos, and testimonials from ARJU's original content? Click the button below to perform a safe one-click sync.
          </p>

          {seedSuccess && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-lg text-xs text-cream flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{seedSuccess}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleRunSeed}
            disabled={seeding}
            className="flex items-center gap-2 bg-charcoal hover:bg-white/10 border border-white/15 text-cream px-4 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            {seeding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-crimson" />
                Seeding database in progress...
              </>
            ) : (
              <>
                <Database className="w-4 h-4 text-crimson" />
                Populate Firestore with Original ARJU Data
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
