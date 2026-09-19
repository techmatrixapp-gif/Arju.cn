import type {
  MenuCategory,
  MenuItem,
  GalleryImage,
  Review,
  GeneralSettings,
  SiteContent,
  Order,
  Booking,
} from "../types/firestore";
import {
  ORDER_CATEGORIES,
  GALLERY,
  TESTIMONIALS,
} from "../data/content";
import {
  DEFAULT_SETTINGS,
  DEFAULT_SITE_CONTENT,
} from "./firestoreData";

const KEYS = {
  CATEGORIES: "arju_menu_categories",
  ITEMS: "arju_menu_items",
  GALLERY: "arju_gallery_items",
  REVIEWS: "arju_reviews",
  SETTINGS: "arju_settings",
  CONTENT: "arju_site_content",
  ORDERS: "arju_orders",
  BOOKINGS: "arju_bookings",
};

export function getLocalCategories(): MenuCategory[] {
  try {
    const raw = localStorage.getItem(KEYS.CATEGORIES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return ORDER_CATEGORIES.map((cat, idx) => ({
    id: cat.id,
    name: cat.label,
    order: idx + 1,
    sortOrder: idx + 1,
    visible: true,
    blurb: cat.blurb || "",
  }));
}

export function saveLocalCategories(cats: MenuCategory[]): void {
  try {
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(cats));
  } catch {}
}

export function getLocalMenuItems(): MenuItem[] {
  try {
    const raw = localStorage.getItem(KEYS.ITEMS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  // Default items from ORDER_CATEGORIES
  const items: MenuItem[] = [];
  let order = 1;
  for (const cat of ORDER_CATEGORIES) {
    for (const it of cat.items) {
      items.push({
        id: it.id,
        categoryId: cat.id,
        name: it.name,
        description: it.desc || "",
        price: Number(it.price) || 0,
        variants: it.variants ? it.variants.map((v) => ({ label: v.label, price: Number(v.price) })) : [],
        tags: it.tag ? [it.tag] : [],
        imageUrl: it.img || "",
        available: true,
        order: order++,
        sortOrder: order,
        popular: !!it.popular,
      });
    }
  }
  return items;
}

export function saveLocalMenuItems(items: MenuItem[]): void {
  try {
    localStorage.setItem(KEYS.ITEMS, JSON.stringify(items));
  } catch {}
}

export function getLocalGallery(): GalleryImage[] {
  try {
    const raw = localStorage.getItem(KEYS.GALLERY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return GALLERY.map((g, idx) => ({
    id: `gal-${idx + 1}`,
    imageUrl: g.src,
    caption: g.caption,
    order: idx + 1,
  }));
}

export function saveLocalGallery(images: GalleryImage[]): void {
  try {
    localStorage.setItem(KEYS.GALLERY, JSON.stringify(images));
  } catch {}
}

export function getLocalSettings(): GeneralSettings {
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {}
  return DEFAULT_SETTINGS;
}

export function saveLocalSettings(settings: GeneralSettings): void {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch {}
}

export function getLocalContent(): SiteContent {
  try {
    const raw = localStorage.getItem(KEYS.CONTENT);
    if (raw) {
      return { ...DEFAULT_SITE_CONTENT, ...JSON.parse(raw) };
    }
  } catch {}
  return DEFAULT_SITE_CONTENT;
}

export function saveLocalContent(content: SiteContent): void {
  try {
    localStorage.setItem(KEYS.CONTENT, JSON.stringify(content));
  } catch {}
}

export function getLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem(KEYS.ORDERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function saveLocalOrders(orders: Order[]): void {
  try {
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
  } catch {}
}

export function getLocalBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(KEYS.BOOKINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function saveLocalBookings(bookings: Booking[]): void {
  try {
    localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(bookings));
  } catch {}
}
