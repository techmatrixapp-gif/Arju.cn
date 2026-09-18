export const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Story", href: "#story" },
  { label: "Menu", href: "#menu" },
  { label: "Order Online", href: "#order" },
  { label: "Gallery", href: "#gallery" },
  { label: "Reviews", href: "#reviews" },
  { label: "Visit", href: "#visit" },
];

export const ORDER_FEES = {
  TAX_RATE: 0.13, // Ontario HST
  DELIVERY_FEE: 4.99,
  FREE_DELIVERY_OVER: 50,
};

export const HOURS = [
  { day: "Monday", hours: "5:00 PM — 10:00 PM" },
  { day: "Tuesday", hours: "5:00 PM — 10:00 PM" },
  { day: "Wednesday", hours: "5:00 PM — 10:00 PM" },
  { day: "Thursday", hours: "5:00 PM — 11:00 PM" },
  { day: "Friday", hours: "5:00 PM — 11:00 PM" },
  { day: "Saturday", hours: "12:00 PM — 11:00 PM" },
  { day: "Sunday", hours: "12:00 PM — 9:00 PM" },
];

export const PHONE = "(647) 531-4715";
export const EMAIL = "info@arju.ca";
export const ADDRESS = "429 Yonge St #102, Toronto, ON M5B 1T1, Canada";

/* ------------------------------------------------------------------ */
/*  IMAGE HELPERS                                                      */
/* ------------------------------------------------------------------ */

const sq = (id: number | string, ext = "jpeg") =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.${ext}?auto=compress&cs=tinysrgb&fit=crop&h=640&w=640`;
const crop = (id: number | string, h: number, w: number, ext = "jpeg") =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.${ext}?auto=compress&cs=tinysrgb&fit=crop&h=${h}&w=${w}`;

/* photo library */
const IMG = {
  // pizza & pasta
  pizzaMargherita: sq(28945103),
  pizzaVeggie: sq(29021737),
  pizzaMeatDeluxe: sq(29021747),
  pizzaPepperoni: sq(30301971),
  pizzaCapri: sq(28236327),
  pizzaMeatLover: sq(26341214),
  pizzaFourCheese: sq(29699537),
  pastaArrabiata: sq(29039081),
  pastaChicken: sq(31064588),
  // shawarma
  wrapChicken: sq(6416559),
  wrapGyro: sq(29306495),
  wrapFalafel: sq(9108725),
  wrapMix: sq(29306499),
  wrapFish: sq(10361459),
  wrapKabab: sq(18698223),
  plateChicken: sq(17650170),
  plateGyro: sq(17650208),
  plateFalafel: sq(36219575),
  plateJerk: sq(17650171),
  plateMix: sq(29253299),
  plateSouvlakiChicken: sq(18698233),
  plateSouvlakiLamb: sq(18698225),
  // biryani
  biryChicken: sq(29631417),
  biryChicken65: sq(17696653),
  biryChickenHari: sq(18620325),
  biryMutton: sq(17696654),
  biryMutton65: sq(17696655),
  biryMuttonHari: sq(17696669),
  biryFish: sq(17649393),
  biryFish65: sq(17649371),
  biryFishHari: sq(17649395),
  biryPrawn: sq(17649396),
  biryPrawn65: sq(17649394),
  biryPrawnHari: sq(24289213),
  biryVeg: sq(28674713),
  biryVeg65: sq(343871),
  birySoyaDum: sq(29631459),
  birySoya65: sq(29631461),
  birySoyaHari: sq(29631468),
  // noodles & rice
  noodleChowmein: sq(18698263),
  noodleSchezwan: sq(30506296),
  noodleCreamy: sq(28895977),
  noodleChilliGarlic: sq(28895978),
  riceThele: sq(343871),
  riceSchezwan: sq(17696653),
  riceBurntGarlic: sq(17650208),
  riceChilliGarlic: sq(17650170),
  // starters - veg / chaap
  chilliPotato: sq(5946431),
  vegManchurian: sq(29631489),
  chilliGobi: sq(28674543),
  chaapChilli: sq(29631468),
  chaapManchurian: sq(29631461),
  chaapCreamy: sq(29631459),
  // starters - chicken
  chilliChicken: sq(29631426),
  manchurianChicken: sq(18698224),
  burntGarlicChicken: sq(5946434),
  schezwanChicken: sq(5946433),
  chicken65: sq(29631422),
  // starters - fish / prawn
  chilliFish: sq(17649395),
  manchurianFish: sq(17649393),
  burntGarlicFish: sq(17649371),
  schezwanFish: sq(13065184),
  fish65: sq(17649371),
  chilliPrawn: sq(29631425),
  manchurianPrawn: sq(17649394),
  burntGarlicPrawn: sq(24289213),
  schezwanPrawn: sq(17649396),
  prawn65: sq(17649395),
  // gravy & momos
  gravyVeg: sq(29631459),
  gravySoya: sq(29631468),
  gravyChicken: sq(29684987),
  gravyFish: sq(17649371),
  gravyPrawn: sq(24289213),
  momoSteam: sq(29253302),
  momoFried: sq(31815436),
  momoChilli: sq(29631461),
  // extras
  raita: sq(29699511),
  tandoori: sq(29699526),
};

/* ------------------------------------------------------------------ */
/*  SIGNATURES (featured cards)                                       */
/* ------------------------------------------------------------------ */

export const SIGNATURES = [
  {
    id: "biry-chicken-dum",
    category: "Biryani",
    name: "Chicken Dum Biryani",
    desc: "Slow-cooked chicken layered with aromatic rice, fried onions and bold spices",
    price: "12.99",
    img: crop(29631417, 900, 720),
    tag: "Slow-Cooked",
  },
  {
    id: "star-chilli-chicken",
    category: "Hakka Starters",
    name: "Chilli Chicken",
    desc: "Crispy chicken tossed with peppers, onions and our house chilli sauce",
    price: "13.99",
    img: crop(29631426, 900, 720),
    tag: "Wok-Tossed",
  },
  {
    id: "wrap-chicken-shawarma-large",
    category: "Shawarma",
    name: "Chicken Shawarma Wrap",
    desc: "Carved grilled chicken, garlic sauce and fresh veg, wrapped and pressed",
    price: "10.99",
    img: crop(6416559, 900, 720),
    tag: "Grilled Fresh",
  },
  {
    id: "pizza-meat-lover-medium",
    category: "Pizza & Pasta",
    name: "Meat Lover Pizza",
    desc: "Arju tomato sauce, mozzarella, pepperoni, chicken and beef — medium",
    price: "18.99",
    img: crop(30301971, 900, 720),
    tag: "Stone-Baked",
  },
];

/* ------------------------------------------------------------------ */
/*  DINE-IN MENU (static, board-style)                                 */
/* ------------------------------------------------------------------ */

export interface MenuItem {
  name: string;
  desc?: string;
  price?: string;
  prices?: { label: string; price: string }[];
  tags?: string[];
  group?: string;
}

export interface MenuTab {
  id: string;
  label: string;
  items: MenuItem[];
  note?: string;
  spice?: boolean;
}

const PIZZA_SIZES = [
  { label: "Medium (serves 2)", price: "$17.99" },
  { label: "Regular (serves 1)", price: "$10.99" },
];

export const MENU_TABS: MenuTab[] = [
  {
    id: "pizza-pasta",
    label: "Pizza & Pasta",
    note: "Additional toppings — Red Pepper, Green Pepper, Mushroom, Red Onion, Tomato, Pepperoni, Chicken, Beef, Olives or Goat Cheese — $1.99 each.",
    items: [
      { group: "Classic Pizza", name: "Margarita", desc: "Arju tomato sauce, mozzarella cheese, fresh basil & oregano.", prices: PIZZA_SIZES, tags: ["V"] },
      { group: "Classic Pizza", name: "Veggie Deluxe", desc: "Pizza sauce, mozzarella cheese with mushroom, tomato & green pepper.", prices: [{ label: "Medium (serves 2)", price: "$17.99" }, { label: "Regular (serves 1)", price: "$9.99" }], tags: ["V"] },
      { group: "Classic Pizza", name: "Meat Deluxe", desc: "Pizza sauce, mozzarella, pepperoni/chicken, mushroom and green pepper.", prices: PIZZA_SIZES },
      { group: "Classic Pizza", name: "Pepperoni Pizza", desc: "Pizza sauce, mozzarella cheese & pepperoni.", prices: PIZZA_SIZES },
      { group: "Classic Pizza", name: "Capri", desc: "Arju tomato sauce, mozzarella, chicken, onions, mushrooms & goat cheese.", prices: PIZZA_SIZES },
      { group: "Classic Pizza", name: "Meat Lover", desc: "Arju tomato sauce, mozzarella cheese, pepperoni, chicken, and beef.", prices: [{ label: "Medium (serves 2)", price: "$18.99" }, { label: "Regular (serves 1)", price: "$11.99" }], tags: ["Popular"] },
      { group: "Classic Pizza", name: "Four Cheese", desc: "Arju tomato sauce, mozzarella, goat cheese, parmesan cheese & feta cheese.", prices: PIZZA_SIZES, tags: ["V"] },
      { group: "Pasta", name: "Penne Arabiata", desc: "Sun-dried tomatoes & hot peppers in Arju tomato sauce.", prices: [{ label: "Medium (serves 2)", price: "$17.99" }, { label: "Regular (serves 1)", price: "$9.99" }], tags: ["V", "Spicy"] },
      { group: "Pasta", name: "Chicken Pasta", desc: "Arju tomato sauce, linguine with chicken.", prices: [{ label: "Medium (serves 2)", price: "$18.99" }, { label: "Regular (serves 1)", price: "$10.99" }] },
    ],
  },
  {
    id: "shawarma",
    label: "Shawarma",
    note: "Plates come with rice, fresh salad, pita and house sauces. Wraps and plates are available Regular (serves 1) or Large (serves 2).",
    items: [
      { group: "Wraps", name: "Chicken Shawarma Wrap", prices: [{ label: "Large", price: "$10.99" }, { label: "Regular", price: "$6.99" }], tags: ["Popular"] },
      { group: "Wraps", name: "Gyro Wrap", prices: [{ label: "Large", price: "$10.99" }, { label: "Regular", price: "$6.99" }] },
      { group: "Wraps", name: "Fresh Cooked Falafel Wrap", prices: [{ label: "Large", price: "$10.99" }, { label: "Regular", price: "$6.99" }], tags: ["V"] },
      { group: "Wraps", name: "Chicken & Gyro Mix Wrap", prices: [{ label: "Large", price: "$12.99" }, { label: "Regular", price: "$7.99" }] },
      { group: "Wraps", name: "Gyro & Falafel Mix Wrap", prices: [{ label: "Large", price: "$12.99" }, { label: "Regular", price: "$7.99" }] },
      { group: "Wraps", name: "Chicken & Falafel Mix Wrap", prices: [{ label: "Large", price: "$12.99" }, { label: "Regular", price: "$7.99" }] },
      { group: "Wraps", name: "Fish Wrap", prices: [{ label: "Large", price: "$12.99" }, { label: "Regular", price: "$7.99" }] },
      { group: "Wraps", name: "Chicken Kabab Wrap", prices: [{ label: "Large", price: "$13.99" }, { label: "Regular", price: "$8.99" }] },
      { group: "Wraps", name: "Lamb Kabab Wrap", prices: [{ label: "Large", price: "$13.99" }, { label: "Regular", price: "$8.99" }] },
      { group: "Plates", name: "Chicken Shawarma Plate", prices: [{ label: "Large", price: "$16.99" }, { label: "Regular", price: "$9.99" }], tags: ["Popular"] },
      { group: "Plates", name: "Gyro Plate", prices: [{ label: "Large", price: "$16.99" }, { label: "Regular", price: "$9.99" }] },
      { group: "Plates", name: "Fresh Cooked Falafel Plate", prices: [{ label: "Large", price: "$16.99" }, { label: "Regular", price: "$9.99" }], tags: ["V"] },
      { group: "Plates", name: "Jerk Chicken Plate", prices: [{ label: "Large", price: "$16.99" }, { label: "Regular", price: "$9.99" }] },
      { group: "Plates", name: "Chicken & Gyro Mix Plate", prices: [{ label: "Large", price: "$19.99" }, { label: "Regular", price: "$10.99" }] },
      { group: "Plates", name: "Chicken & Falafel Mix Plate", prices: [{ label: "Large", price: "$19.99" }, { label: "Regular", price: "$10.99" }] },
      { group: "Plates", name: "Gyro & Falafel Mix Plate", prices: [{ label: "Large", price: "$19.99" }, { label: "Regular", price: "$10.99" }] },
      { group: "Plates", name: "Chicken Souvlaki Plate", prices: [{ label: "Large", price: "$20.99" }, { label: "Regular", price: "$10.99" }] },
      { group: "Plates", name: "Lamb Souvlaki Plate", prices: [{ label: "Large", price: "$20.99" }, { label: "Regular", price: "$10.99" }] },
    ],
  },
  {
    id: "biryani",
    label: "Biryani",
    spice: true,
    note: "Add-ons: Raita $1.50 · Boiled Egg $1.50 · Extra Rice $3.00 · Extra Protein $4.00.",
    items: [
      { group: "Chicken", name: "Chicken Dum Biryani", price: "$12.99", tags: ["Popular"] },
      { group: "Chicken", name: "Chicken 65 Biryani", price: "$13.99" },
      { group: "Chicken", name: "Chicken Hari Mirch Ki Biryani", price: "$13.99", tags: ["Spicy"] },
      { group: "Mutton", name: "Mutton Dum Biryani", price: "$14.99" },
      { group: "Mutton", name: "Mutton 65 Biryani", price: "$14.99" },
      { group: "Mutton", name: "Mutton Hari Mirch Ki Biryani", price: "$14.99", tags: ["Spicy"] },
      { group: "Fish", name: "Fish Dum Biryani", price: "$13.99" },
      { group: "Fish", name: "Fish 65 Biryani", price: "$14.99" },
      { group: "Fish", name: "Fish Hari Mirch Ki Biryani", price: "$14.99", tags: ["Spicy"] },
      { group: "Prawn", name: "Prawn Dum Biryani", price: "$14.99" },
      { group: "Prawn", name: "Prawn 65 Biryani", price: "$14.99" },
      { group: "Prawn", name: "Prawn Hari Mirch Ki Biryani", price: "$14.99", tags: ["Spicy"] },
      { group: "Vegetable", name: "Veg Dum Biryani", price: "$10.99", tags: ["V"] },
      { group: "Vegetable", name: "Veg 65 Biryani", price: "$11.99", tags: ["V"] },
      { group: "Vegetable", name: "Veg Hari Mirch Ki Biryani", price: "$11.99", tags: ["V", "Spicy"] },
      { group: "Soya Chaap", name: "Soya Chaap Dum Biryani", price: "$11.99", tags: ["V"] },
      { group: "Soya Chaap", name: "Soya Chaap 65 Biryani", price: "$12.99", tags: ["V"] },
      { group: "Soya Chaap", name: "Soya Chaap Hari Mirch Ki Biryani", price: "$12.99", tags: ["V", "Spicy"] },
      { group: "Add-ons", name: "Raita", price: "$1.50", tags: ["V"] },
      { group: "Add-ons", name: "Boiled Egg", price: "$1.50", tags: ["V"] },
      { group: "Add-ons", name: "Extra Rice", price: "$3.00", tags: ["V"] },
      { group: "Add-ons", name: "Extra Protein", price: "$4.00" },
    ],
  },
  {
    id: "hakka-noodles-rice",
    label: "Noodles & Rice",
    spice: true,
    note: "All noodles and fried rice come with vegetables. Add Chicken, Fish or Prawn +$1.99 · Egg +$1.00.",
    items: [
      { group: "Hakka Noodles", name: "Mumbai Street Style Chowmein", price: "$12.99", tags: ["V", "Popular"] },
      { group: "Hakka Noodles", name: "Schezwan Noodles", price: "$13.99", tags: ["Spicy"] },
      { group: "Hakka Noodles", name: "Creamy Garlic Noodles", price: "$13.99" },
      { group: "Hakka Noodles", name: "Chilly Garlic Noodles", price: "$13.99", tags: ["Spicy"] },
      { group: "Fried Rice", name: "Thele Waale Fried Rice", price: "$12.99", tags: ["V"] },
      { group: "Fried Rice", name: "Schezwan Fried Rice", price: "$13.99", tags: ["Spicy"] },
      { group: "Fried Rice", name: "Burnt Garlic Fried Rice", price: "$13.99" },
      { group: "Fried Rice", name: "Chilly Garlic Fried Rice", price: "$13.99", tags: ["Spicy"] },
    ],
  },
  {
    id: "hakka-starters",
    label: "Hakka Starters",
    spice: true,
    note: "Crispy, saucy and made for sharing — choose any dish in Chilli, Manchurian, Burnt Garlic or Schezwan style.",
    items: [
      { group: "Vegetable", name: "Crispy Chilli Potato", price: "$12.99", tags: ["V", "Spicy"] },
      { group: "Vegetable", name: "Veg Manchurian", price: "$13.99", tags: ["V"] },
      { group: "Vegetable", name: "Chilli Gobi", price: "$14.99", tags: ["V", "Spicy"] },
      { group: "Soya Chaap", name: "Chilli Chaap", price: "$12.99", tags: ["V", "Spicy"] },
      { group: "Soya Chaap", name: "Manchurian Chaap", price: "$13.99", tags: ["V"] },
      { group: "Soya Chaap", name: "Creamy Garlic Chaap", price: "$14.99", tags: ["V"] },
      { group: "Soya Chaap", name: "Schezwan Chaap", price: "$14.99", tags: ["V", "Spicy"] },
      { group: "Chicken", name: "Chilli Chicken", price: "$13.99", tags: ["Popular", "Spicy"] },
      { group: "Chicken", name: "Manchurian Chicken", price: "$14.99" },
      { group: "Chicken", name: "Burnt Garlic Chicken", price: "$14.99" },
      { group: "Chicken", name: "Schezwan Chicken", price: "$14.99", tags: ["Spicy"] },
      { group: "Chicken", name: "Chicken 65", price: "$14.99", tags: ["Spicy"] },
      { group: "Fish", name: "Chilli Fish", price: "$13.99", tags: ["Spicy"] },
      { group: "Fish", name: "Manchurian Fish", price: "$13.99" },
      { group: "Fish", name: "Burnt Garlic Fish", price: "$13.99" },
      { group: "Fish", name: "Schezwan Fish", price: "$13.99", tags: ["Spicy"] },
      { group: "Fish", name: "Fish 65", price: "$14.99", tags: ["Spicy"] },
      { group: "Prawn", name: "Chilli Prawn", price: "$14.99", tags: ["Spicy"] },
      { group: "Prawn", name: "Manchurian Prawn", price: "$14.99" },
      { group: "Prawn", name: "Burnt Garlic Prawn", price: "$14.99" },
      { group: "Prawn", name: "Schezwan Prawn", price: "$14.99", tags: ["Spicy"] },
      { group: "Prawn", name: "Prawn 65", price: "$15.99", tags: ["Spicy"] },
    ],
  },
  {
    id: "gravy-momos",
    label: "Gravy & Momos",
    spice: true,
    note: "Gravy dishes include steamed rice — upgrade to fried rice or noodles +$2.00. Momo gravies: Chilli Garlic, Schezwan, Creamy Garlic, Mumbai Wala Teekha or Momo Red Chutney.",
    items: [
      { group: "Hakka Gravy — choose your protein", name: "Vegetable Gravy", desc: "Chilli · Manchurian · Burnt Garlic · Schezwan, with steamed rice.", price: "$14.99", tags: ["V"] },
      { group: "Hakka Gravy — choose your protein", name: "Soya Chaap Gravy", desc: "Chilli · Manchurian · Burnt Garlic · Schezwan, with steamed rice.", price: "$14.99", tags: ["V"] },
      { group: "Hakka Gravy — choose your protein", name: "Chicken Gravy", desc: "Chilli · Manchurian · Burnt Garlic · Schezwan, with steamed rice.", price: "$15.99" },
      { group: "Hakka Gravy — choose your protein", name: "Fish Gravy", desc: "Chilli · Manchurian · Burnt Garlic · Schezwan, with steamed rice.", price: "$15.99" },
      { group: "Hakka Gravy — choose your protein", name: "Prawn Gravy", desc: "Chilli · Manchurian · Burnt Garlic · Schezwan, with steamed rice.", price: "$17.99" },
      { group: "Momos", name: "Veg Steamed Momos", price: "$14.99", tags: ["V"] },
      { group: "Momos", name: "Veg Fried Momos", price: "$15.99", tags: ["V"] },
      { group: "Momos", name: "Veg Chilli Momos", price: "$16.99", tags: ["V", "Spicy"] },
      { group: "Momos", name: "Chicken Steamed Momos", price: "$14.99" },
      { group: "Momos", name: "Chicken Fried Momos", price: "$15.99" },
      { group: "Momos", name: "Chicken Chilli Momos", price: "$16.99", tags: ["Spicy"] },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  ONLINE ORDER MENU                                                  */
/* ------------------------------------------------------------------ */

export interface OrderVariant {
  label: string;
  price: number;
}

export interface OrderItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  img: string;
  tag?: string;
  popular?: boolean;
  variants?: OrderVariant[];
}

export interface OrderCategory {
  id: string;
  label: string;
  blurb: string;
  items: OrderItem[];
}

const WRAP_SIZES: OrderVariant[] = [
  { label: "Regular", price: 6.99 },
  { label: "Large", price: 10.99 },
];
const WRAP_SIZES_799: OrderVariant[] = [
  { label: "Regular", price: 7.99 },
  { label: "Large", price: 12.99 },
];
const WRAP_SIZES_899: OrderVariant[] = [
  { label: "Regular", price: 8.99 },
  { label: "Large", price: 13.99 },
];
const PLATE_SIZES: OrderVariant[] = [
  { label: "Regular", price: 9.99 },
  { label: "Large", price: 16.99 },
];
const PLATE_SIZES_1099: OrderVariant[] = [
  { label: "Regular", price: 10.99 },
  { label: "Large", price: 19.99 },
];
const PLATE_SIZES_SOUV: OrderVariant[] = [
  { label: "Regular", price: 10.99 },
  { label: "Large", price: 20.99 },
];
const PIZZA_SIZES_ORDER: OrderVariant[] = [
  { label: "Regular", price: 10.99 },
  { label: "Medium", price: 17.99 },
];

export const ORDER_CATEGORIES: OrderCategory[] = [
  {
    id: "order-pizza",
    label: "Pizza & Pasta",
    blurb: "Freshly baked favourites and comforting pasta classics.",
    items: [
      { id: "pizza-margarita", name: "Margarita", desc: "Arju tomato sauce, mozzarella, fresh basil & oregano", price: 10.99, img: IMG.pizzaMargherita, tag: "V", variants: PIZZA_SIZES_ORDER },
      { id: "pizza-veggie-deluxe", name: "Veggie Deluxe", desc: "Mozzarella, mushroom, tomato & green pepper", price: 9.99, img: IMG.pizzaVeggie, tag: "V", variants: [{ label: "Regular", price: 9.99 }, { label: "Medium", price: 17.99 }] },
      { id: "pizza-meat-deluxe", name: "Meat Deluxe", desc: "Mozzarella, pepperoni/chicken, mushroom & green pepper", price: 10.99, img: IMG.pizzaMeatDeluxe, variants: PIZZA_SIZES_ORDER },
      { id: "pizza-pepperoni", name: "Pepperoni Pizza", desc: "Pizza sauce, mozzarella cheese & pepperoni", price: 10.99, img: IMG.pizzaPepperoni, variants: PIZZA_SIZES_ORDER, popular: true },
      { id: "pizza-capri", name: "Capri", desc: "Mozzarella, chicken, onions, mushrooms & goat cheese", price: 10.99, img: IMG.pizzaCapri, variants: PIZZA_SIZES_ORDER },
      { id: "pizza-meat-lover", name: "Meat Lover", desc: "Mozzarella, pepperoni, chicken and beef", price: 11.99, img: IMG.pizzaMeatLover, variants: [{ label: "Regular", price: 11.99 }, { label: "Medium", price: 18.99 }] },
      { id: "pizza-four-cheese", name: "Four Cheese", desc: "Mozzarella, goat cheese, parmesan & feta", price: 10.99, img: IMG.pizzaFourCheese, tag: "V", variants: PIZZA_SIZES_ORDER },
      { id: "pasta-penne-arabiata", name: "Penne Arabiata", desc: "Sun-dried tomatoes & hot peppers in Arju tomato sauce", price: 9.99, img: IMG.pastaArrabiata, tag: "V", variants: [{ label: "Regular", price: 9.99 }, { label: "Medium", price: 17.99 }] },
      { id: "pasta-chicken", name: "Chicken Pasta", desc: "Arju tomato sauce, linguine with chicken", price: 10.99, img: IMG.pastaChicken, variants: [{ label: "Regular", price: 10.99 }, { label: "Medium", price: 18.99 }] },
    ],
  },
  {
    id: "order-shawarma",
    label: "Shawarma",
    blurb: "Grilled favourites, served fresh and full of flavour.",
    items: [
      { id: "wrap-chicken-shawarma", name: "Chicken Shawarma Wrap", desc: "Carved grilled chicken, garlic sauce & fresh veg", price: 6.99, img: IMG.wrapChicken, variants: WRAP_SIZES, popular: true },
      { id: "wrap-gyro", name: "Gyro Wrap", desc: "Spit-roasted gyro, tzatziki, tomato & onion", price: 6.99, img: IMG.wrapGyro, variants: WRAP_SIZES },
      { id: "wrap-falafel", name: "Fresh Cooked Falafel Wrap", desc: "Crispy falafel, tahini, pickles & herbs", price: 6.99, img: IMG.wrapFalafel, tag: "V", variants: WRAP_SIZES },
      { id: "wrap-chicken-gyro", name: "Chicken & Gyro Mix Wrap", desc: "The best of both spits, garlic sauce & veg", price: 7.99, img: IMG.wrapMix, variants: WRAP_SIZES_799 },
      { id: "wrap-gyro-falafel", name: "Gyro & Falafel Mix Wrap", desc: "Gyro, falafel, tahini and fresh salad", price: 7.99, img: IMG.wrapMix, variants: WRAP_SIZES_799 },
      { id: "wrap-chicken-falafel", name: "Chicken & Falafel Mix Wrap", desc: "Grilled chicken and crispy falafel, garlic-tahini", price: 7.99, img: IMG.wrapFalafel, variants: WRAP_SIZES_799 },
      { id: "wrap-fish", name: "Fish Wrap", desc: "Crispy fish, slaw and house chilli sauce", price: 7.99, img: IMG.wrapFish, variants: WRAP_SIZES_799 },
      { id: "wrap-chicken-kabab", name: "Chicken Kabab Wrap", desc: "Char-grilled chicken kabab, garlic & pickles", price: 8.99, img: IMG.wrapKabab, variants: WRAP_SIZES_899 },
      { id: "wrap-lamb-kabab", name: "Lamb Kabab Wrap", desc: "Char-grilled lamb kabab, herbs and house sauce", price: 8.99, img: IMG.wrapKabab, variants: WRAP_SIZES_899 },
      { id: "plate-chicken-shawarma", name: "Chicken Shawarma Plate", desc: "Rice, salad, pita, garlic sauce & carved chicken", price: 9.99, img: IMG.plateChicken, variants: PLATE_SIZES, popular: true },
      { id: "plate-gyro", name: "Gyro Plate", desc: "Rice, salad, pita, tzatziki & gyro", price: 9.99, img: IMG.plateGyro, variants: PLATE_SIZES },
      { id: "plate-falafel", name: "Fresh Cooked Falafel Plate", desc: "Rice, salad, pita, hummus & falafel", price: 9.99, img: IMG.plateFalafel, tag: "V", variants: PLATE_SIZES },
      { id: "plate-jerk-chicken", name: "Jerk Chicken Plate", desc: "Jerk-glazed chicken, rice, salad & pita", price: 9.99, img: IMG.plateJerk, variants: PLATE_SIZES },
      { id: "plate-chicken-gyro", name: "Chicken & Gyro Mix Plate", desc: "Chicken and gyro over rice with all the sides", price: 10.99, img: IMG.plateMix, variants: PLATE_SIZES_1099 },
      { id: "plate-chicken-falafel", name: "Chicken & Falafel Mix Plate", desc: "Grilled chicken and falafel over rice", price: 10.99, img: IMG.plateChicken, variants: PLATE_SIZES_1099 },
      { id: "plate-gyro-falafel", name: "Gyro & Falafel Mix Plate", desc: "Gyro and falafel over rice with all the sides", price: 10.99, img: IMG.plateMix, variants: PLATE_SIZES_1099 },
      { id: "plate-chicken-souvlaki", name: "Chicken Souvlaki Plate", desc: "Skewered chicken, Greek potatoes, pita & tzatziki", price: 10.99, img: IMG.plateSouvlakiChicken, variants: PLATE_SIZES_SOUV },
      { id: "plate-lamb-souvlaki", name: "Lamb Souvlaki Plate", desc: "Skewered lamb, Greek potatoes, pita & tzatziki", price: 10.99, img: IMG.plateSouvlakiLamb, variants: PLATE_SIZES_SOUV },
    ],
  },
  {
    id: "order-biryani",
    label: "Biryani",
    blurb: "Slow-cooked, layered with aromatic rice and bold spices.",
    items: [
      { id: "biry-chicken-dum", name: "Chicken Dum Biryani", desc: "Classic slow-cooked chicken biryani", price: 12.99, img: IMG.biryChicken, popular: true },
      { id: "biry-chicken-65", name: "Chicken 65 Biryani", desc: "Spicy fried chicken over layered rice", price: 13.99, img: IMG.biryChicken65 },
      { id: "biry-chicken-hari", name: "Chicken Hari Mirch Ki Biryani", desc: "Green-chilli chicken biryani", price: 13.99, img: IMG.biryChickenHari, tag: "Spicy" },
      { id: "biry-mutton-dum", name: "Mutton Dum Biryani", desc: "Slow-cooked mutton over aromatic rice", price: 14.99, img: IMG.biryMutton },
      { id: "biry-mutton-65", name: "Mutton 65 Biryani", desc: "Spicy fried mutton over layered rice", price: 14.99, img: IMG.biryMutton65 },
      { id: "biry-mutton-hari", name: "Mutton Hari Mirch Ki Biryani", desc: "Green-chilli mutton biryani", price: 14.99, img: IMG.biryMuttonHari, tag: "Spicy" },
      { id: "biry-fish-dum", name: "Fish Dum Biryani", desc: "Slow-cooked fish biryani", price: 13.99, img: IMG.biryFish },
      { id: "biry-fish-65", name: "Fish 65 Biryani", desc: "Spicy fried fish over layered rice", price: 14.99, img: IMG.biryFish65 },
      { id: "biry-fish-hari", name: "Fish Hari Mirch Ki Biryani", desc: "Green-chilli fish biryani", price: 14.99, img: IMG.biryFishHari, tag: "Spicy" },
      { id: "biry-prawn-dum", name: "Prawn Dum Biryani", desc: "Slow-cooked prawn biryani", price: 14.99, img: IMG.biryPrawn },
      { id: "biry-prawn-65", name: "Prawn 65 Biryani", desc: "Spicy fried prawn over layered rice", price: 14.99, img: IMG.biryPrawn65 },
      { id: "biry-prawn-hari", name: "Prawn Hari Mirch Ki Biryani", desc: "Green-chilli prawn biryani", price: 14.99, img: IMG.biryPrawnHari, tag: "Spicy" },
      { id: "biry-veg-dum", name: "Veg Dum Biryani", desc: "Garden vegetables over aromatic rice", price: 10.99, img: IMG.biryVeg, tag: "V" },
      { id: "biry-veg-65", name: "Veg 65 Biryani", desc: "Spicy veg 65 over layered rice", price: 11.99, img: IMG.biryVeg65, tag: "V" },
      { id: "biry-veg-hari", name: "Veg Hari Mirch Ki Biryani", desc: "Green-chilli vegetable biryani", price: 11.99, img: IMG.birySoyaDum, tag: "V" },
      { id: "biry-soya-dum", name: "Soya Chaap Dum Biryani", desc: "Slow-cooked soya chaap biryani", price: 11.99, img: IMG.birySoyaDum, tag: "V" },
      { id: "biry-soya-65", name: "Soya Chaap 65 Biryani", desc: "Spicy soya chaap over layered rice", price: 12.99, img: IMG.birySoya65, tag: "V" },
      { id: "biry-soya-hari", name: "Soya Chaap Hari Mirch Ki Biryani", desc: "Green-chilli soya chaap biryani", price: 12.99, img: IMG.birySoyaHari, tag: "V" },
    ],
  },
  {
    id: "order-noodles",
    label: "Noodles & Rice",
    blurb: "Wok-tossed Indo-Chinese classics — add your protein in Extras.",
    items: [
      { id: "noodle-chowmein", name: "Mumbai Street Style Chowmein", desc: "The classic street-style hakka noodles", price: 12.99, img: IMG.noodleChowmein, tag: "V", popular: true },
      { id: "noodle-schezwan", name: "Schezwan Noodles", desc: "Bold schezwan sauce, peppers & spring onion", price: 13.99, img: IMG.noodleSchezwan, tag: "Spicy" },
      { id: "noodle-creamy-garlic", name: "Creamy Garlic Noodles", desc: "Silky garlic-cream sauce, tossed in the wok", price: 13.99, img: IMG.noodleCreamy },
      { id: "noodle-chilli-garlic", name: "Chilly Garlic Noodles", desc: "Hot garlic sauce with crunchy veg", price: 13.99, img: IMG.noodleChilliGarlic, tag: "Spicy" },
      { id: "rice-thele-waale", name: "Thele Waale Fried Rice", desc: "Street-cart style wok fried rice", price: 12.99, img: IMG.riceThele, tag: "V" },
      { id: "rice-schezwan", name: "Schezwan Fried Rice", desc: "Fiery schezwan fried rice", price: 13.99, img: IMG.riceSchezwan, tag: "Spicy" },
      { id: "rice-burnt-garlic", name: "Burnt Garlic Fried Rice", desc: "Smoky burnt garlic and scallion", price: 13.99, img: IMG.riceBurntGarlic },
      { id: "rice-chilli-garlic", name: "Chilly Garlic Fried Rice", desc: "Hot garlic fried rice, wok-tossed", price: 13.99, img: IMG.riceChilliGarlic, tag: "Spicy" },
    ],
  },
  {
    id: "order-starters",
    label: "Hakka Starters",
    blurb: "Crispy, saucy and made for sharing.",
    items: [
      { id: "star-chilli-potato", name: "Crispy Chilli Potato", desc: "Crisp potatoes, sweet chilli glaze, sesame", price: 12.99, img: IMG.chilliPotato, tag: "V" },
      { id: "star-veg-manchurian", name: "Veg Manchurian", desc: "Veg dumplings in manchurian gravy", price: 13.99, img: IMG.vegManchurian, tag: "V" },
      { id: "star-chilli-gobi", name: "Chilli Gobi", desc: "Crispy cauliflower, chilli & peppers", price: 14.99, img: IMG.chilliGobi, tag: "V" },
      { id: "star-chilli-chaap", name: "Chilli Chaap", desc: "Soya chaap in house chilli sauce", price: 12.99, img: IMG.chaapChilli, tag: "V" },
      { id: "star-manchurian-chaap", name: "Manchurian Chaap", desc: "Soya chaap tossed manchurian-style", price: 13.99, img: IMG.chaapManchurian, tag: "V" },
      { id: "star-creamy-garlic-chaap", name: "Creamy Garlic Chaap", desc: "Soya chaap in silky garlic cream", price: 14.99, img: IMG.chaapCreamy, tag: "V" },
      { id: "star-schezwan-chaap", name: "Schezwan Chaap", desc: "Soya chaap in fiery schezwan sauce", price: 14.99, img: IMG.chaapManchurian, tag: "V" },
      { id: "star-chilli-chicken", name: "Chilli Chicken", desc: "Crispy chicken, peppers & house chilli sauce", price: 13.99, img: IMG.chilliChicken, popular: true },
      { id: "star-manchurian-chicken", name: "Manchurian Chicken", desc: "Chicken dumplings in manchurian gravy", price: 14.99, img: IMG.manchurianChicken },
      { id: "star-burnt-garlic-chicken", name: "Burnt Garlic Chicken", desc: "Smoky garlic, scallion & crispy chicken", price: 14.99, img: IMG.burntGarlicChicken },
      { id: "star-schezwan-chicken", name: "Schezwan Chicken", desc: "Bold schezwan sauce, wok-tossed", price: 14.99, img: IMG.schezwanChicken, tag: "Spicy" },
      { id: "star-chicken-65", name: "Chicken 65", desc: "South-style spicy fried chicken", price: 14.99, img: IMG.chicken65, tag: "Spicy" },
      { id: "star-chilli-fish", name: "Chilli Fish", desc: "Crispy fish in house chilli sauce", price: 13.99, img: IMG.chilliFish },
      { id: "star-manchurian-fish", name: "Manchurian Fish", desc: "Fish tossed manchurian-style", price: 13.99, img: IMG.manchurianFish },
      { id: "star-burnt-garlic-fish", name: "Burnt Garlic Fish", desc: "Smoky garlic fish, wok-tossed", price: 13.99, img: IMG.burntGarlicFish },
      { id: "star-schezwan-fish", name: "Schezwan Fish", desc: "Fish in fiery schezwan sauce", price: 13.99, img: IMG.schezwanFish, tag: "Spicy" },
      { id: "star-fish-65", name: "Fish 65", desc: "South-style spicy fried fish", price: 14.99, img: IMG.fish65, tag: "Spicy" },
      { id: "star-chilli-prawn", name: "Chilli Prawn", desc: "Prawns, peppers & house chilli sauce", price: 14.99, img: IMG.chilliPrawn },
      { id: "star-manchurian-prawn", name: "Manchurian Prawn", desc: "Prawns tossed manchurian-style", price: 14.99, img: IMG.manchurianPrawn },
      { id: "star-burnt-garlic-prawn", name: "Burnt Garlic Prawn", desc: "Smoky garlic prawns, wok-tossed", price: 14.99, img: IMG.burntGarlicPrawn },
      { id: "star-schezwan-prawn", name: "Schezwan Prawn", desc: "Prawns in fiery schezwan sauce", price: 14.99, img: IMG.schezwanPrawn, tag: "Spicy" },
      { id: "star-prawn-65", name: "Prawn 65", desc: "South-style spicy fried prawns", price: 15.99, img: IMG.prawn65, tag: "Spicy" },
    ],
  },
  {
    id: "order-gravy",
    label: "Gravy & Momos",
    blurb: "Comforting gravies, steamed favourites and bold sauces.",
    items: [
      { id: "gravy-veg", name: "Vegetable Gravy", desc: "Chilli, Manchurian, Burnt Garlic or Schezwan with steamed rice", price: 14.99, img: IMG.gravyVeg, tag: "V" },
      { id: "gravy-soya", name: "Soya Chaap Gravy", desc: "Chilli, Manchurian, Burnt Garlic or Schezwan with steamed rice", price: 14.99, img: IMG.gravySoya, tag: "V" },
      { id: "gravy-chicken", name: "Chicken Gravy", desc: "Chilli, Manchurian, Burnt Garlic or Schezwan with steamed rice", price: 15.99, img: IMG.gravyChicken, popular: true },
      { id: "gravy-fish", name: "Fish Gravy", desc: "Chilli, Manchurian, Burnt Garlic or Schezwan with steamed rice", price: 15.99, img: IMG.gravyFish },
      { id: "gravy-prawn", name: "Prawn Gravy", desc: "Chilli, Manchurian, Burnt Garlic or Schezwan with steamed rice", price: 17.99, img: IMG.gravyPrawn },
      { id: "momo-veg-steamed", name: "Veg Steamed Momos", desc: "Eight steamed dumplings with red chutney", price: 14.99, img: IMG.momoSteam, tag: "V" },
      { id: "momo-veg-fried", name: "Veg Fried Momos", desc: "Pan-fried dumplings, crispy edges", price: 15.99, img: IMG.momoFried, tag: "V" },
      { id: "momo-veg-chilli", name: "Veg Chilli Momos", desc: "Tossed in chilli garlic sauce", price: 16.99, img: IMG.momoChilli, tag: "V" },
      { id: "momo-chicken-steamed", name: "Chicken Steamed Momos", desc: "Eight steamed chicken dumplings", price: 14.99, img: IMG.momoSteam },
      { id: "momo-chicken-fried", name: "Chicken Fried Momos", desc: "Pan-fried chicken dumplings", price: 15.99, img: IMG.momoFried },
      { id: "momo-chicken-chilli", name: "Chicken Chilli Momos", desc: "Tossed in chilli garlic sauce", price: 16.99, img: IMG.momoChilli, tag: "Spicy" },
    ],
  },
  {
    id: "order-extras",
    label: "Extras & Add-ons",
    blurb: "Make it your way — toppings, protein upgrades and sides.",
    items: [
      { id: "extra-pizza-topping", name: "Extra Pizza Topping", desc: "Pepperoni, chicken, beef, mushroom, olives, goat cheese & more", price: 1.99, img: IMG.pizzaFourCheese },
      { id: "add-chicken", name: "Add Chicken", desc: "Protein upgrade for noodles, rice or gravy", price: 1.99, img: IMG.chicken65 },
      { id: "add-fish", name: "Add Fish", desc: "Protein upgrade for noodles, rice or gravy", price: 1.99, img: IMG.gravyFish },
      { id: "add-prawn", name: "Add Prawn", desc: "Protein upgrade for noodles, rice or gravy", price: 1.99, img: IMG.chilliPrawn },
      { id: "add-egg", name: "Add Egg", desc: "Egg upgrade for noodles or fried rice", price: 1.0, img: IMG.riceThele, tag: "V" },
      { id: "upgrade-fried-rice", name: "Upgrade to Fried Rice", desc: "Swap steamed rice with your gravy for fried rice", price: 2.0, img: IMG.riceThele, tag: "V" },
      { id: "upgrade-noodles", name: "Upgrade to Noodles", desc: "Swap steamed rice with your gravy for noodles", price: 2.0, img: IMG.noodleChowmein, tag: "V" },
      { id: "extra-raita", name: "Raita", desc: "Cool yogurt with fresh vegetables & spices", price: 1.5, img: IMG.raita, tag: "V" },
      { id: "extra-boiled-egg", name: "Boiled Egg", desc: "Biryani add-on", price: 1.5, img: IMG.riceThele, tag: "V" },
      { id: "extra-rice", name: "Extra Rice", desc: "Additional portion of steamed rice", price: 3.0, img: IMG.biryVeg, tag: "V" },
      { id: "extra-protein", name: "Extra Protein", desc: "Additional portion of chicken, mutton or prawn", price: 4.0, img: IMG.tandoori },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  GALLERY / REVIEWS / SITE IMAGES                                    */
/* ------------------------------------------------------------------ */

export const GALLERY = [
  { src: crop(37307273, 800, 1100), caption: "The candlelit dining room" },
  { src: crop(29631426, 1100, 800), caption: "Chilli chicken, wok-tossed" },
  { src: crop(18698263, 800, 1100), caption: "Hakka noodles, full wok hei" },
  { src: crop(39268201, 800, 1100), caption: "The red lounge" },
  { src: crop(6416559, 1100, 800), caption: "Shawarma, carved fresh" },
  { src: crop(29631417, 1100, 800), caption: "Biryani, layered by hand" },
  { src: crop(10135116, 800, 1100), caption: "Our corner booth" },
  { src: crop(28945103, 800, 1100), caption: "Stone-baked to order" },
  { src: crop(29253302, 1100, 800), caption: "Momos & red chutney" },
];

export const TESTIMONIALS = [
  {
    name: "Simran Manohar",
    initials: "SM",
    when: "2 weeks ago",
    stars: 5,
    text: "One of the best Hakka spots downtown, for sure. The chilli chicken is crispy, saucy and actually spicy, and the hakka noodles have real wok hei. Generous portions, warm service from the second we walked in. We'll be back every week now.",
  },
  {
    name: "Marcus Chen",
    initials: "MC",
    when: "1 month ago",
    stars: 5,
    text: "Rainy night takeout that saved the week — mutton dum biryani, schezwan noodles and a plate of chilli momos. The biryani was fragrant, perfectly layered and huge, the momos had real kick. Everything was packed hot and clearly made to order. This place is officially our Friday ritual.",
  },
  {
    name: "Elena Rodrigues",
    initials: "ER",
    when: "3 months ago",
    stars: 5,
    text: "Ordered the crispy chilli potato, chicken 65, prawn schezwan and steamed momos for a group and honestly everything was 10/10. Proper heat, massive portions and it travelled perfectly for pickup. The shawarma wraps disappeared in minutes. Highly recommend for groups and game nights.",
  },
];

export const IMAGES = {
  hero: crop(18698263, 1300, 2200),
  story: crop(29021744, 1200, 900),
  storySmall: crop(29631417, 600, 800),
  chef: crop(36904788, 1200, 900),
  visit: crop(10135116, 900, 1400),
};
