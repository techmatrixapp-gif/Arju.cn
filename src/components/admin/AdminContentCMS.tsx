import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import type { SiteContent } from "../../types/firestore";
import { DEFAULT_SITE_CONTENT } from "../../services/firestoreData";
import {
  FileText,
  Save,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Clock,
  Globe,
  Share2,
} from "lucide-react";

export default function AdminContentCMS() {
  const [content, setContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadContent() {
      try {
        const docRef = doc(db, "siteContent", "main");
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setContent({
            ...DEFAULT_SITE_CONTENT,
            ...(snap.data() as Partial<SiteContent>),
          });
        }
      } catch (err: any) {
        console.warn("Failed to load siteContent doc:", err);
      } finally {
        setLoading(false);
      }
    }
    loadContent();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      const docRef = doc(db, "siteContent", "main");
      await setDoc(
        docRef,
        {
          ...content,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error("Save site content error:", err);
      setErrorMessage(err?.message || "Failed to save site content to Firestore.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm("Reset all content fields to default values?")) {
      setContent(DEFAULT_SITE_CONTENT);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-crimson border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-crimson/15 text-crimson-bright border border-crimson/30">
              <FileText className="h-5 w-5" />
            </span>
            <h1 className="font-display text-2xl font-bold text-cream">Site Content CMS</h1>
          </div>
          <p className="mt-1.5 text-xs text-stone">
            Update customer-facing headlines, hero imagery, story copy, and contact details across the public website.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="inline-flex items-center gap-2 border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-stone hover:text-cream hover:bg-white/10 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Defaults
          </button>
          <button
            type="submit"
            form="site-content-form"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-crimson hover:bg-crimson-bright px-5 py-2 text-xs font-semibold uppercase tracking-wider text-cream transition-colors disabled:opacity-50"
          >
            {saving ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-cream border-t-transparent" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save Changes
          </button>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="flex items-center gap-3 border border-emerald-500/40 bg-emerald-950/40 px-4 py-3 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>Site content updated successfully! Public pages are now reading these live values.</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-3 border border-rose-500/40 bg-rose-950/40 px-4 py-3 text-xs text-rose-300">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form id="site-content-form" onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Hero Banner */}
        <div className="border border-white/10 bg-coal p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 text-crimson-bright border-b border-white/10 pb-3">
            <Sparkles className="h-4 w-4" />
            <h2 className="font-display text-lg font-bold text-cream">Hero Section (Homepage)</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone block">
                Hero Headline
              </label>
              <input
                type="text"
                value={content.heroTitle || ""}
                onChange={(e) => setContent({ ...content, heroTitle: e.target.value })}
                placeholder="e.g. Downtown Toronto's Halal Wok & Grill"
                className="w-full border border-white/15 bg-ink px-4 py-3 text-sm text-cream placeholder-stone/50 focus:border-crimson focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone block">
                Hero Subtitle / Description
              </label>
              <textarea
                rows={3}
                value={content.heroSubtitle || ""}
                onChange={(e) => setContent({ ...content, heroSubtitle: e.target.value })}
                placeholder="Describe your kitchen highlights, culinary traditions, and location..."
                className="w-full border border-white/15 bg-ink px-4 py-3 text-sm text-cream placeholder-stone/50 focus:border-crimson focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone block">
                Hero Background Image URL
              </label>
              <input
                type="url"
                value={content.heroImage || ""}
                onChange={(e) => setContent({ ...content, heroImage: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full border border-white/15 bg-ink px-4 py-3 text-sm text-cream placeholder-stone/50 focus:border-crimson focus:outline-none"
              />
              {content.heroImage && (
                <div className="mt-3 relative h-36 w-full max-w-md overflow-hidden border border-white/15">
                  <img
                    src={content.heroImage}
                    alt="Hero Preview"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-2 left-2 bg-ink/80 px-2 py-0.5 text-[10px] text-cream">
                    Live Preview
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: About & Story */}
        <div className="border border-white/10 bg-coal p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 text-crimson-bright border-b border-white/10 pb-3">
            <FileText className="h-4 w-4" />
            <h2 className="font-display text-lg font-bold text-cream">About & Brand Story</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone block">
                Main Story & Culinary Philosophy
              </label>
              <textarea
                rows={4}
                value={content.aboutText || ""}
                onChange={(e) => setContent({ ...content, aboutText: e.target.value })}
                placeholder="Tell guests the origin of ARJU, your commitment to Halal and fresh ingredients..."
                className="w-full border border-white/15 bg-ink px-4 py-3 text-sm text-cream placeholder-stone/50 focus:border-crimson focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone block">
                Founders / Heritage Blurb
              </label>
              <input
                type="text"
                value={content.aboutFounders || ""}
                onChange={(e) => setContent({ ...content, aboutFounders: e.target.value })}
                placeholder="e.g. Family-run, multicultural kitchen serving Toronto since 2016."
                className="w-full border border-white/15 bg-ink px-4 py-3 text-sm text-cream placeholder-stone/50 focus:border-crimson focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Contact Details */}
        <div className="border border-white/10 bg-coal p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 text-crimson-bright border-b border-white/10 pb-3">
            <Phone className="h-4 w-4" />
            <h2 className="font-display text-lg font-bold text-cream">Contact & Visit Details</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone">
                <Phone className="h-3 w-3" /> Phone Number
              </label>
              <input
                type="text"
                value={content.contactInfo?.phone || ""}
                onChange={(e) =>
                  setContent({
                    ...content,
                    contactInfo: { ...content.contactInfo, phone: e.target.value },
                  })
                }
                placeholder="(647) 531-4715"
                className="w-full border border-white/15 bg-ink px-4 py-3 text-sm text-cream placeholder-stone/50 focus:border-crimson focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone">
                <Mail className="h-3 w-3" /> Email Address
              </label>
              <input
                type="email"
                value={content.contactInfo?.email || ""}
                onChange={(e) =>
                  setContent({
                    ...content,
                    contactInfo: { ...content.contactInfo, email: e.target.value },
                  })
                }
                placeholder="info@arju.ca"
                className="w-full border border-white/15 bg-ink px-4 py-3 text-sm text-cream placeholder-stone/50 focus:border-crimson focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone">
                <MapPin className="h-3 w-3" /> Physical Street Address
              </label>
              <input
                type="text"
                value={content.contactInfo?.address || ""}
                onChange={(e) =>
                  setContent({
                    ...content,
                    contactInfo: { ...content.contactInfo, address: e.target.value },
                  })
                }
                placeholder="429 Yonge St #102, Toronto, ON M5B 1T1, Canada"
                className="w-full border border-white/15 bg-ink px-4 py-3 text-sm text-cream placeholder-stone/50 focus:border-crimson focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone">
                <Clock className="h-3 w-3" /> Operating Hours Summary
              </label>
              <input
                type="text"
                value={content.contactInfo?.hours || ""}
                onChange={(e) =>
                  setContent({
                    ...content,
                    contactInfo: { ...content.contactInfo, hours: e.target.value },
                  })
                }
                placeholder="Mon-Sat: 11:30 AM — 10:30 PM, Sun: 12:00 PM — 9:00 PM"
                className="w-full border border-white/15 bg-ink px-4 py-3 text-sm text-cream placeholder-stone/50 focus:border-crimson focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Social Media Links */}
        <div className="border border-white/10 bg-coal p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 text-crimson-bright border-b border-white/10 pb-3">
            <Share2 className="h-4 w-4" />
            <h2 className="font-display text-lg font-bold text-cream">Social Channels</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone">
                <Globe className="h-3 w-3" /> Instagram URL
              </label>
              <input
                type="url"
                value={content.socialLinks?.instagram || ""}
                onChange={(e) =>
                  setContent({
                    ...content,
                    socialLinks: { ...content.socialLinks, instagram: e.target.value },
                  })
                }
                placeholder="https://instagram.com/arjudelights"
                className="w-full border border-white/15 bg-ink px-4 py-3 text-sm text-cream placeholder-stone/50 focus:border-crimson focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone">
                <Globe className="h-3 w-3" /> Facebook URL
              </label>
              <input
                type="url"
                value={content.socialLinks?.facebook || ""}
                onChange={(e) =>
                  setContent({
                    ...content,
                    socialLinks: { ...content.socialLinks, facebook: e.target.value },
                  })
                }
                placeholder="https://facebook.com/arjudelights"
                className="w-full border border-white/15 bg-ink px-4 py-3 text-sm text-cream placeholder-stone/50 focus:border-crimson focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone">
                <Share2 className="h-3 w-3" /> TikTok URL
              </label>
              <input
                type="url"
                value={content.socialLinks?.tiktok || ""}
                onChange={(e) =>
                  setContent({
                    ...content,
                    socialLinks: { ...content.socialLinks, tiktok: e.target.value },
                  })
                }
                placeholder="https://tiktok.com/@arjudelights"
                className="w-full border border-white/15 bg-ink px-4 py-3 text-sm text-cream placeholder-stone/50 focus:border-crimson focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-crimson hover:bg-crimson-bright px-8 py-3 text-xs font-semibold uppercase tracking-wider text-cream transition-colors shadow-lg hover:shadow-crimson/25 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-cream border-t-transparent" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save All Content Changes
          </button>
        </div>
      </form>
    </div>
  );
}
