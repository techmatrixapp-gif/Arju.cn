import {
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  ORDER_CATEGORIES,
  MENU_TABS,
  GALLERY,
  TESTIMONIALS,
  HOURS,
  PHONE,
  EMAIL,
  ADDRESS,
} from "./content";
import type {
  MenuCategory,
  MenuItem,
  GalleryImage,
  Review,
  GeneralSettings,
} from "../types/firestore";

export async function seedFirestore(
  onProgress?: (message: string) => void
): Promise<{ success: boolean; message: string; categories: number; items: number }> {
  try {
    onProgress?.("Starting Firestore seed...");

    // 1. Seed Menu Categories & Menu Items from ORDER_CATEGORIES
    onProgress?.("Seeding categories and menu items...");
    let categoryOrder = 1;
    let itemOrder = 1;

    for (const cat of ORDER_CATEGORIES) {
      const catRef = doc(db, "menuCategories", cat.id);
      const aliasCatRef = doc(db, "categories", cat.id);
      const catData: MenuCategory = {
        id: cat.id,
        name: cat.label,
        order: categoryOrder++,
        sortOrder: categoryOrder,
        visible: true,
        blurb: cat.blurb || "",
      };
      await setDoc(catRef, catData, { merge: true });
      await setDoc(aliasCatRef, catData, { merge: true });

      // Add items for this category
      for (const item of cat.items) {
        const itemRef = doc(db, "menuItems", item.id);
        const itemData: any = {
          id: item.id,
          categoryId: cat.id,
          category: cat.id,
          name: item.name,
          description: item.desc || "",
          price: Number(item.price) || 0,
          variants: item.variants ? item.variants.map((v) => ({ label: v.label, price: Number(v.price) })) : [],
          tags: item.tag ? [item.tag] : [],
          imageUrl: item.img || "",
          available: true,
          order: itemOrder++,
          sortOrder: itemOrder,
          popular: !!item.popular,
          updatedAt: new Date().toISOString(),
        };
        await setDoc(itemRef, itemData, { merge: true });
      }
    }

    // Also supplement any items in MENU_TABS that might not be in ORDER_CATEGORIES
    for (const tab of MENU_TABS) {
      // Check if tab category exists
      const catRef = doc(db, "menuCategories", tab.id);
      await setDoc(
        catRef,
        {
          id: tab.id,
          name: tab.label,
          order: categoryOrder++,
          visible: true,
          blurb: tab.note || "",
        },
        { merge: true }
      );

      let groupItemIdx = 1;
      for (const item of tab.items) {
        const generatedId = `${tab.id}-${item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
        const itemRef = doc(db, "menuItems", generatedId);
        
        let primaryPrice = 0;
        let variants: { label: string; price: number }[] = [];
        if (item.prices && item.prices.length > 0) {
          primaryPrice = parseFloat(item.prices[0].price.replace(/[^0-9.]/g, "")) || 0;
          variants = item.prices.map((p: any) => ({
            label: p.label,
            price: parseFloat(p.price.replace(/[^0-9.]/g, "")) || 0,
          }));
        } else if (item.price) {
          primaryPrice = parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0;
        }

        const itemData: Partial<MenuItem> = {
          id: generatedId,
          categoryId: tab.id,
          name: item.name,
          description: item.desc || "",
          price: primaryPrice,
          variants,
          tags: item.tags || [],
          available: true,
          group: item.group || "",
          order: groupItemIdx++,
        };
        await setDoc(itemRef, itemData, { merge: true });
      }
    }

    // 2. Seed Gallery
    onProgress?.("Seeding gallery photos...");
    let galleryOrder = 1;
    for (const img of GALLERY) {
      const galId = `gal-${galleryOrder}`;
      const galRef = doc(db, "gallery", galId);
      const galData: GalleryImage = {
        id: galId,
        imageUrl: img.src,
        caption: img.caption,
        order: galleryOrder++,
      };
      await setDoc(galRef, galData, { merge: true });
    }

    // 3. Seed Reviews (Testimonials)
    onProgress?.("Seeding reviews...");
    let reviewIdx = 1;
    for (const test of TESTIMONIALS) {
      const revId = `rev-${reviewIdx++}`;
      const revRef = doc(db, "reviews", revId);
      const revData: Review = {
        id: revId,
        name: test.name,
        stars: test.stars,
        text: test.text,
        approved: true,
        createdAt: new Date().toISOString(),
      };
      await setDoc(revRef, revData, { merge: true });
    }

    // 4. Seed Settings/General
    onProgress?.("Seeding settings & store hours...");
    const settingsRef = doc(db, "settings", "general");
    const settingsData: GeneralSettings = {
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
      slotDurationMinutes: 90,
      maxPartySize: 12,
    };
    await setDoc(settingsRef, settingsData, { merge: true });

    // 5. Seed siteContent CMS
    onProgress?.("Seeding site content CMS...");
    const siteContentRef = doc(db, "siteContent", "main");
    await setDoc(
      siteContentRef,
      {
        heroTitle: "Downtown Toronto's Halal Wok & Grill",
        heroSubtitle: "Stone-baked pizza, slow-layered biryani, wok-tossed Hakka classics and shawarma carved to order — made to order on Yonge Street.",
        heroImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1920&q=80",
        aboutText: "ARJU opened its doors on Yonge Street with a simple conviction: the food Toronto loves most is the food the world brought with it. We cook across traditions because that's how this city eats.",
        aboutFounders: "Family-run, multicultural kitchen serving Toronto since 2016.",
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
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    onProgress?.("Seeding complete! All collections populated.");
    return {
      success: true,
      message: "Firestore database seeded successfully!",
      categories: categoryOrder - 1,
      items: itemOrder - 1,
    };
  } catch (err: any) {
    console.error("Firestore seed error:", err);
    return {
      success: false,
      message: err?.message || "Failed to seed Firestore",
      categories: 0,
      items: 0,
    };
  }
}

// Auto-run if executed via CLI
if (typeof process !== "undefined" && process.argv && process.argv[1]?.includes("seed.ts")) {
  seedFirestore((msg) => console.log(`[Seed] ${msg}`)).then((res) => {
    console.log(res.message);
    process.exit(res.success ? 0 : 1);
  });
}
