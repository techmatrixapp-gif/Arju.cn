/**
 * One-time Node.js migration script using firebase-admin to seed existing
 * hardcoded menu data and initial site content into Firestore.
 *
 * Usage:
 *   export GOOGLE_APPLICATION_CREDENTIALS="./serviceAccountKey.json"
 *   node scripts/migrate-to-firestore.mjs
 *
 * Alternatively, with Firebase Project ID:
 *   FIREBASE_PROJECT_ID="arju-30636" node scripts/migrate-to-firestore.mjs
 */

import admin from "firebase-admin";

const projectId = process.env.FIREBASE_PROJECT_ID || "arju-30636";

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      projectId,
    });
  } catch (err) {
    console.error("Failed to initialize firebase-admin:", err);
    process.exit(1);
  }
}

const db = admin.firestore();

// Hardcoded Categories & Menu Items Data
const CATEGORIES_DATA = [
  {
    id: "popular",
    name: "Chef's Signatures",
    sortOrder: 1,
    visible: true,
    blurb: "The dishes that built our reputation on Yonge Street.",
    items: [
      {
        id: "sig-hyderabadi-dum-biryani",
        name: "Hyderabadi Dum Biryani",
        description: "Slow-cooked mutton with saffron basmati, sealed with dough in a handi. Served with mirchi ka salan and raita.",
        price: 18.99,
        category: "popular",
        tags: ["Signature", "Halal"],
        available: true,
        sortOrder: 1,
        popular: true,
        imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "sig-chilli-chicken-hakka",
        name: "Toronto Hakka Chilli Chicken",
        description: "Crispy chicken tossed in a screaming-hot wok with bird's eye chillies, green peppers, ginger, and our dark soy reduction.",
        price: 16.99,
        category: "popular",
        tags: ["Popular", "Spicy"],
        available: true,
        sortOrder: 2,
        popular: true,
        imageUrl: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "sig-arju-tandoori-shawarma-plate",
        name: "ARJU Carved Shawarma Plate",
        description: "Shaved marinated chicken shawarma over spiced rice with pickled turnips, toum garlic whip, hummus, and warm pita.",
        price: 17.49,
        category: "popular",
        tags: ["Popular", "Halal"],
        available: true,
        sortOrder: 3,
        popular: true,
        imageUrl: "https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "sig-spicy-butter-chicken-pizza",
        name: "Stone-Baked Butter Chicken Pizza",
        description: "San Marzano sauce meets makhani reduction, tandoori chicken, red onion, charred paneer, fresh cilantro on 48h cold fermented dough.",
        price: 21.99,
        category: "popular",
        tags: ["Chef's Pick"],
        available: true,
        sortOrder: 4,
        popular: true,
        imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
      }
    ]
  },
  {
    id: "hakka",
    name: "Wok-Fired Hakka",
    sortOrder: 2,
    visible: true,
    blurb: "High-heat Chinese-Indian street classics tossed fresh to order.",
    items: [
      {
        id: "hakka-manchurian-chicken",
        name: "Chicken Manchurian (Gravy / Dry)",
        description: "Minced chicken dumplings in a rich coriander, dark soy, and garlic reduction with spring scallions.",
        price: 16.49,
        category: "hakka",
        tags: ["Spicy"],
        available: true,
        sortOrder: 1,
        imageUrl: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "hakka-schezwan-fried-rice",
        name: "Schezwan Fried Rice",
        description: "Wok-charred basmati tossed with fiery house schezwan paste, carrots, cabbage, and scrambled farm egg.",
        price: 14.99,
        category: "hakka",
        tags: ["Spicy"],
        available: true,
        sortOrder: 2,
        imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "hakka-crispy-beef",
        name: "Crispy Ginger Beef",
        description: "Flash-fried prime beef strips glazed in a sweet-spicy ginger reduction with sesame seeds.",
        price: 17.99,
        category: "hakka",
        tags: ["Popular"],
        available: true,
        sortOrder: 3,
        imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
      }
    ]
  },
  {
    id: "biryani",
    name: "Handi Biryanis",
    sortOrder: 3,
    visible: true,
    blurb: "Slow-layered fragrant basmati with royal whole spices.",
    items: [
      {
        id: "biryani-chicken-dum",
        name: "Royal Chicken Dum Biryani",
        description: "Tender bone-in chicken thighs marinated overnight in yoghurt and green paste, steamed under dough seal.",
        price: 16.99,
        category: "biryani",
        tags: ["Popular", "Halal"],
        available: true,
        sortOrder: 1,
        imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "biryani-veggie-paneer",
        name: "Paneer & Garden Vegetable Biryani",
        description: "Charred cottage cheese cubes, cauliflower, green peas, and saffron kewra essence.",
        price: 15.49,
        category: "biryani",
        tags: ["Vegetarian"],
        available: true,
        sortOrder: 2,
        imageUrl: "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?auto=format&fit=crop&w=1200&q=80",
      }
    ]
  },
  {
    id: "pizza",
    name: "Stone-Baked Pizza",
    sortOrder: 4,
    visible: true,
    blurb: "48-hour cold fermented dough baked at 750°F.",
    items: [
      {
        id: "pizza-margherita",
        name: "Classic Yonge Margherita",
        description: "San Marzano D.O.P. tomatoes, fresh fior di latte mozzarella, whole leaf basil, and cold-pressed olive oil.",
        price: 18.99,
        category: "pizza",
        tags: ["Vegetarian"],
        available: true,
        sortOrder: 1,
        imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "pizza-tandoori-paneer",
        name: "Tandoori Paneer Supreme",
        description: "Clay-oven roasted spiced paneer, sweet bell peppers, red onion, mozzarella, and drizzle of mint chutney.",
        price: 20.99,
        category: "pizza",
        tags: ["Vegetarian", "Popular"],
        available: true,
        sortOrder: 2,
        imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
      }
    ]
  }
];

async function runMigration() {
  console.log(`Starting Firestore migration for project: ${projectId}`);

  const batch = db.batch();

  // 1. Categories & MenuItems
  let totalItems = 0;
  for (const cat of CATEGORIES_DATA) {
    const catRef = db.collection("categories").doc(cat.id);
    const menuCatRef = db.collection("menuCategories").doc(cat.id);

    const catPayload = {
      name: cat.name,
      sortOrder: cat.sortOrder,
      order: cat.sortOrder,
      visible: cat.visible,
      blurb: cat.blurb,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    batch.set(catRef, catPayload, { merge: true });
    batch.set(menuCatRef, catPayload, { merge: true });

    for (const item of cat.items) {
      const itemRef = db.collection("menuItems").doc(item.id);
      const itemPayload = {
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        categoryId: item.category,
        imageUrl: item.imageUrl,
        available: item.available,
        sortOrder: item.sortOrder,
        order: item.sortOrder,
        tags: item.tags || [],
        popular: !!item.popular,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      batch.set(itemRef, itemPayload, { merge: true });
      totalItems++;
    }
  }

  // 2. Site Content CMS
  const siteContentRef = db.collection("siteContent").doc("main");
  batch.set(
    siteContentRef,
    {
      heroTitle: "Downtown Toronto's Halal Wok & Grill",
      heroSubtitle: "Stone-baked pizza, slow-layered biryani, wok-tossed Hakka classics and shawarma carved to order — made to order on Yonge Street.",
      heroImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1920&q=80",
      aboutText: "ARJU opened its doors on Yonge Street with a simple conviction: the food Toronto loves most is the food the world brought with it. We cook across traditions because that's how this city eats.",
      aboutFounders: "Family-run, multicultural kitchen serving Toronto since 2016.",
      contactInfo: {
        phone: "(647) 531-4715",
        email: "info@arju.ca",
        address: "429 Yonge St #102, Toronto, ON M5B 1T1, Canada",
        hours: "Mon-Sat: 11:30 AM — 10:30 PM, Sun: 12:00 PM — 9:00 PM"
      },
      socialLinks: {
        instagram: "https://instagram.com/arjudelights",
        facebook: "https://facebook.com/arjudelights",
        tiktok: "https://tiktok.com/@arjudelights"
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    { merge: true }
  );

  // 3. Settings
  const settingsRef = db.collection("settings").doc("general");
  batch.set(
    settingsRef,
    {
      phone: "(647) 531-4715",
      email: "info@arju.ca",
      address: "429 Yonge St #102, Toronto, ON M5B 1T1, Canada",
      slotDurationMinutes: 90,
      maxPartySize: 12,
      storeHours: [
        { day: "Monday — Thursday", hours: "11:30 AM — 10:30 PM" },
        { day: "Friday — Saturday", hours: "11:30 AM — 11:30 PM" },
        { day: "Sunday", hours: "12:00 PM — 9:00 PM" }
      ],
      paymentSettings: {
        enableStripe: true,
        enablePayPal: true
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    { merge: true }
  );

  await batch.commit();
  console.log(`Migration successful! Migrated ${CATEGORIES_DATA.length} categories, ${totalItems} menu items, siteContent/main, and settings/general into Firestore.`);
}

runMigration().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
