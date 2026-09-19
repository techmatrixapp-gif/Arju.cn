import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
  doc,
  addDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";
import type {
  MenuCategory,
  MenuItem,
  GalleryImage,
  Review,
  GeneralSettings,
  SiteContent,
  Booking,
  BlockedSlot,
} from "../types/firestore";
import {
  ORDER_CATEGORIES,
  GALLERY,
  TESTIMONIALS,
  HOURS,
  PHONE,
  EMAIL,
  ADDRESS,
} from "../data/content";

// Default fallback settings
export const DEFAULT_SETTINGS: GeneralSettings = {
  storeHours: HOURS,
  phone: PHONE,
  email: EMAIL,
  address: ADDRESS,
  socialLinks: {
    instagram: "https://instagram.com/arjudelights",
    facebook: "https://facebook.com/arjudelights",
    tiktok: "https://tiktok.com/@arjudelights",
  },
  heroHeadline: "A modern celebration of classic Canadian & world flavours.",
  storyText:
    "Rooted in Toronto's vibrant food scene, ARJU brings together slow-layered biryanis, wok-fired Hakka classics, carved shawarma, and stone-baked pizzas crafted with precision and passion.",
  slotDurationMinutes: 90,
  maxPartySize: 12,
  paymentSettings: {
    enableStripe: true,
    enablePayPal: true,
  },
};

export const DEFAULT_SITE_CONTENT: SiteContent = {
  heroTitle: "Downtown Toronto's Halal Wok & Grill",
  heroSubtitle:
    "Stone-baked pizza, slow-layered biryani, wok-tossed Hakka classics and shawarma carved to order — made to order on Yonge Street.",
  heroImage:
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1920&q=80",
  aboutText:
    "ARJU opened its doors on Yonge Street with a simple conviction: the food Toronto loves most is the food the world brought with it. We cook across traditions because that's how this city eats.",
  aboutFounders: "Family-run, multicultural kitchen serving downtown Toronto since 2016.",
  contactInfo: {
    phone: PHONE,
    email: EMAIL,
    address: ADDRESS,
    hours: "Mon-Sat: 11:30 AM — 10:30 PM, Sun: 12:00 PM — 9:00 PM",
  },
  socialLinks: {
    instagram: "https://instagram.com/arjudelights",
    facebook: "https://facebook.com/arjudelights",
    tiktok: "https://tiktok.com/@arjudelights",
  },
};

// Hook for Categories (checks categories collection, falls back to menuCategories, then static fallback)
export function useCategories() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    try {
      const q = query(collection(db, "categories"));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!active) return;
          if (!snapshot.empty) {
            const data: MenuCategory[] = snapshot.docs.map((d) => {
              const dData = d.data();
              return {
                id: d.id,
                name: dData.name || dData.label || d.id,
                order: dData.order ?? dData.sortOrder ?? 1,
                sortOrder: dData.sortOrder ?? dData.order ?? 1,
                visible: dData.visible !== false,
                blurb: dData.blurb || "",
              };
            });
            data.sort((a, b) => (a.order || 0) - (b.order || 0));
            setCategories(data);
            setLoading(false);
          } else {
            // Check menuCategories collection as fallback
            const q2 = query(collection(db, "menuCategories"));
            getDocs(q2)
              .then((snap2) => {
                if (!active) return;
                if (!snap2.empty) {
                  const data2: MenuCategory[] = snap2.docs.map((d) => {
                    const dData = d.data();
                    return {
                      id: d.id,
                      name: dData.name || dData.label || d.id,
                      order: dData.order ?? dData.sortOrder ?? 1,
                      sortOrder: dData.sortOrder ?? dData.order ?? 1,
                      visible: dData.visible !== false,
                      blurb: dData.blurb || "",
                    };
                  });
                  data2.sort((a, b) => (a.order || 0) - (b.order || 0));
                  setCategories(data2);
                } else {
                  // Fallback from ORDER_CATEGORIES
                  setCategories(
                    ORDER_CATEGORIES.map((cat, idx) => ({
                      id: cat.id,
                      name: cat.label,
                      order: idx + 1,
                      sortOrder: idx + 1,
                      visible: true,
                      blurb: cat.blurb,
                    }))
                  );
                }
                setLoading(false);
              })
              .catch(() => {
                if (active) setLoading(false);
              });
          }
        },
        (err) => {
          console.warn("Categories listener fallback:", err.message);
          if (!active) return;
          setError(err.message);
          setCategories(
            ORDER_CATEGORIES.map((cat, idx) => ({
              id: cat.id,
              name: cat.label,
              order: idx + 1,
              sortOrder: idx + 1,
              visible: true,
              blurb: cat.blurb,
            }))
          );
          setLoading(false);
        }
      );
      return () => {
        active = false;
        unsubscribe();
      };
    } catch (e: any) {
      setError(e?.message || "Failed to load categories");
      setLoading(false);
    }
  }, []);

  return { categories, loading, error };
}

// Hook for Menu Items
export function useMenuItems() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    try {
      const q = query(collection(db, "menuItems"));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!active) return;
          if (!snapshot.empty) {
            const data: MenuItem[] = snapshot.docs.map((docSnap) => {
              const d = docSnap.data();
              return {
                id: docSnap.id,
                categoryId: d.categoryId || d.category || "",
                name: d.name || "",
                description: d.description || d.desc || "",
                price: Number(d.price) || 0,
                variants: d.variants || [],
                tags: d.tags || (d.tag ? [d.tag] : []),
                imageUrl: d.imageUrl || d.img || "",
                available: d.available !== false,
                order: d.order ?? d.sortOrder ?? 1,
                sortOrder: d.sortOrder ?? d.order ?? 1,
                popular: !!d.popular,
                createdAt: d.createdAt,
                updatedAt: d.updatedAt,
              };
            });
            data.sort((a, b) => (a.order || 0) - (b.order || 0));
            setItems(data);
          } else {
            // Fallback from static ORDER_CATEGORIES
            const fallback: MenuItem[] = [];
            let o = 1;
            ORDER_CATEGORIES.forEach((cat) => {
              cat.items.forEach((item) => {
                fallback.push({
                  id: item.id,
                  categoryId: cat.id,
                  name: item.name,
                  description: item.desc || "",
                  price: Number(item.price) || 0,
                  variants: item.variants
                    ? item.variants.map((v) => ({ label: v.label, price: Number(v.price) }))
                    : [],
                  tags: item.tag ? [item.tag] : [],
                  imageUrl: item.img || "",
                  available: true,
                  order: o++,
                  sortOrder: o,
                  popular: !!item.popular,
                });
              });
            });
            setItems(fallback);
          }
          setLoading(false);
        },
        (err) => {
          console.warn("MenuItems listener fallback:", err.message);
          if (!active) return;
          setError(err.message);
          const fallback: MenuItem[] = [];
          let o = 1;
          ORDER_CATEGORIES.forEach((cat) => {
            cat.items.forEach((item) => {
              fallback.push({
                id: item.id,
                categoryId: cat.id,
                name: item.name,
                description: item.desc || "",
                price: Number(item.price) || 0,
                variants: item.variants
                  ? item.variants.map((v) => ({ label: v.label, price: Number(v.price) }))
                  : [],
                tags: item.tag ? [item.tag] : [],
                imageUrl: item.img || "",
                available: true,
                order: o++,
                sortOrder: o,
                popular: !!item.popular,
              });
            });
          });
          setItems(fallback);
          setLoading(false);
        }
      );
      return () => {
        active = false;
        unsubscribe();
      };
    } catch (e: any) {
      setError(e?.message || "Failed to load menu items");
      setLoading(false);
    }
  }, []);

  return { items, loading, error };
}

// Hook for Site Content (CMS)
export function useSiteContent() {
  const [content, setContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    try {
      const docRef = doc(db, "siteContent", "main");
      const unsubscribe = onSnapshot(
        docRef,
        (snap) => {
          if (!active) return;
          if (snap.exists()) {
            setContent({
              ...DEFAULT_SITE_CONTENT,
              ...(snap.data() as Partial<SiteContent>),
            });
          }
          setLoading(false);
        },
        (err) => {
          console.warn("SiteContent fallback:", err.message);
          if (active) setLoading(false);
        }
      );
      return () => {
        active = false;
        unsubscribe();
      };
    } catch (e) {
      setLoading(false);
    }
  }, []);

  return { content, loading };
}

// Hook for Blocked Slots (all or by date)
export function useBlockedSlots(targetDate?: string) {
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    try {
      const coll = collection(db, "blockedSlots");
      const q = targetDate ? query(coll, where("date", "==", targetDate)) : coll;
      const unsubscribe = onSnapshot(
        q,
        (snap) => {
          if (!active) return;
          const data: BlockedSlot[] = snap.docs.map((d) => ({
            id: d.id,
            date: d.data().date,
            time: d.data().time || "all-day",
            reason: d.data().reason || "Blocked by management",
            createdAt: d.data().createdAt,
          }));
          setBlockedSlots(data);
          setLoading(false);
        },
        () => {
          if (active) setLoading(false);
        }
      );
      return () => {
        active = false;
        unsubscribe();
      };
    } catch (e) {
      setLoading(false);
    }
  }, [targetDate]);

  return { blockedSlots, loading };
}

// Hook for Bookings (for Admin and conflict validation)
export function useBookings(targetDate?: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    try {
      const coll = collection(db, "bookings");
      const q = targetDate ? query(coll, where("date", "==", targetDate)) : coll;
      const unsubscribe = onSnapshot(
        q,
        (snap) => {
          if (!active) return;
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
              status: data.status || "pending",
              notes: data.notes || "",
              internalNotes: data.internalNotes || "",
              tableNumber: data.tableNumber || "",
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            };
          });
          // Sort by date then time desc
          list.sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
          setBookings(list);
          setLoading(false);
        },
        () => {
          if (active) setLoading(false);
        }
      );
      return () => {
        active = false;
        unsubscribe();
      };
    } catch (e) {
      setLoading(false);
    }
  }, [targetDate]);

  return { bookings, loading };
}

// Conflict-safe reservation creation function
export async function createReservationBooking(params: {
  customerName: string;
  phone: string;
  email: string;
  partySize: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  notes?: string;
}): Promise<{ success: boolean; id?: string; message: string }> {
  try {
    const { customerName, phone, email, partySize, date, time, notes } = params;

    // 1. Check if the slot is blocked in blockedSlots
    const blockedQ = query(
      collection(db, "blockedSlots"),
      where("date", "==", date)
    );
    const blockedSnap = await getDocs(blockedQ);
    const isBlocked = blockedSnap.docs.some((docSnap) => {
      const data = docSnap.data();
      return data.time === "all-day" || data.time === time;
    });

    if (isBlocked) {
      return {
        success: false,
        message: "This date or time slot is unavailable due to a scheduled block or private event. Please select an alternate time.",
      };
    }

    // 2. Check existing bookings on this date & time to prevent capacity conflicts (max 4 concurrent bookings per 30-min slot)
    const bookingQ = query(
      collection(db, "bookings"),
      where("date", "==", date),
      where("time", "==", time)
    );
    const bookingSnap = await getDocs(bookingQ);
    const activeBookings = bookingSnap.docs.filter((d) => {
      const st = d.data().status;
      return st === "pending" || st === "confirmed";
    });

    if (activeBookings.length >= 4) {
      return {
        success: false,
        message: "This time slot was just booked by another guest. Please choose an alternate time.",
      };
    }

    // 3. Create reservation in Firestore with status = 'pending'
    const newDoc = await addDoc(collection(db, "bookings"), {
      customerName,
      name: customerName,
      phone,
      email,
      partySize: Number(partySize),
      date,
      time,
      status: "pending",
      notes: notes || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      id: newDoc.id,
      message: "Reservation received! We have submitted your table request.",
    };
  } catch (err: any) {
    console.error("Reservation booking error:", err);
    return {
      success: false,
      message: err?.message || "An unexpected error occurred while placing your booking.",
    };
  }
}

// Hook for Gallery Images
export function useGalleryImages() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const q = query(collection(db, "gallery"), orderBy("order", "asc"));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const data: GalleryImage[] = snapshot.docs.map(
              (docSnap) => ({ id: docSnap.id, ...docSnap.data() } as GalleryImage)
            );
            setImages(data);
          } else {
            setImages(
              GALLERY.map((g, idx) => ({
                id: `gal-${idx + 1}`,
                imageUrl: g.src,
                caption: g.caption,
                order: idx + 1,
              }))
            );
          }
          setLoading(false);
        },
        (err) => {
          console.warn("Gallery listener fallback:", err.message);
          setImages(
            GALLERY.map((g, idx) => ({
              id: `gal-${idx + 1}`,
              imageUrl: g.src,
              caption: g.caption,
              order: idx + 1,
            }))
          );
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      setLoading(false);
    }
  }, []);

  return { images, loading };
}

// Hook for Approved Reviews
export function useApprovedReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const q = query(collection(db, "reviews"), where("approved", "==", true));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const data: Review[] = snapshot.docs.map(
              (docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Review)
            );
            setReviews(data);
          } else {
            setReviews(
              TESTIMONIALS.map((t, idx) => ({
                id: `rev-${idx + 1}`,
                name: t.name,
                stars: t.stars,
                text: t.text,
                approved: true,
                createdAt: t.when || new Date().toISOString(),
              }))
            );
          }
          setLoading(false);
        },
        (err) => {
          console.warn("Reviews listener fallback:", err.message);
          setReviews(
            TESTIMONIALS.map((t, idx) => ({
              id: `rev-${idx + 1}`,
              name: t.name,
              stars: t.stars,
              text: t.text,
              approved: true,
              createdAt: t.when || new Date().toISOString(),
            }))
          );
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      setLoading(false);
    }
  }, []);

  return { reviews, loading };
}

// Hook for General Settings
export function useSettings() {
  const [settings, setSettings] = useState<GeneralSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const settingsRef = doc(db, "settings", "general");
      const unsubscribe = onSnapshot(
        settingsRef,
        (snapshot) => {
          if (snapshot.exists()) {
            setSettings({
              ...DEFAULT_SETTINGS,
              ...(snapshot.data() as Partial<GeneralSettings>),
            });
          }
          setLoading(false);
        },
        (err) => {
          console.warn("Settings listener fallback:", err.message);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      setLoading(false);
    }
  }, []);

  return { settings, loading };
}

