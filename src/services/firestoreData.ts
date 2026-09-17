import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import type {
  MenuCategory,
  MenuItem,
  GalleryImage,
  Review,
  GeneralSettings,
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
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    tiktok: "https://tiktok.com",
  },
  heroHeadline: "A modern celebration of classic Canadian & world flavours.",
  storyText:
    "Rooted in Toronto's vibrant food scene, ARJU brings together slow-layered biryanis, wok-fired Hakka classics, carved shawarma, and stone-baked pizzas crafted with precision and passion.",
  paymentSettings: {
    enableStripe: true,
    enablePayPal: true,
  },
};

// Hook for Categories
export function useCategories() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const q = query(collection(db, "menuCategories"), orderBy("order", "asc"));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const data: MenuCategory[] = snapshot.docs.map(
              (doc) => ({ id: doc.id, ...doc.data() } as MenuCategory)
            );
            setCategories(data);
          } else {
            // Fallback from ORDER_CATEGORIES
            setCategories(
              ORDER_CATEGORIES.map((cat, idx) => ({
                id: cat.id,
                name: cat.label,
                order: idx + 1,
                visible: true,
                blurb: cat.blurb,
              }))
            );
          }
          setLoading(false);
        },
        (err) => {
          console.warn("Categories listener fallback to static content:", err.message);
          setCategories(
            ORDER_CATEGORIES.map((cat, idx) => ({
              id: cat.id,
              name: cat.label,
              order: idx + 1,
              visible: true,
              blurb: cat.blurb,
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

  return { categories, loading };
}

// Hook for Menu Items
export function useMenuItems() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const q = query(collection(db, "menuItems"), orderBy("order", "asc"));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const data: MenuItem[] = snapshot.docs.map(
              (doc) => ({ id: doc.id, ...doc.data() } as MenuItem)
            );
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
                  popular: !!item.popular,
                });
              });
            });
            setItems(fallback);
          }
          setLoading(false);
        },
        (err) => {
          console.warn("MenuItems listener fallback to static content:", err.message);
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
                popular: !!item.popular,
              });
            });
          });
          setItems(fallback);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      setLoading(false);
    }
  }, []);

  return { items, loading };
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
              (doc) => ({ id: doc.id, ...doc.data() } as GalleryImage)
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
          console.warn("Gallery listener fallback to static content:", err.message);
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
      const q = query(
        collection(db, "reviews"),
        where("approved", "==", true)
      );
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const data: Review[] = snapshot.docs.map(
              (doc) => ({ id: doc.id, ...doc.data() } as Review)
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
          console.warn("Reviews listener fallback to static content:", err.message);
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
          console.warn("Settings listener fallback to static content:", err.message);
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
