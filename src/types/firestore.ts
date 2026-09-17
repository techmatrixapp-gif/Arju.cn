export type OrderStatus = "new" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled";
export type BookingStatus = "pending" | "confirmed" | "cancelled";

export interface MenuCategory {
  id: string;
  name: string;
  order: number;
  visible: boolean;
  blurb?: string;
  label?: string;
}

export interface MenuItemVariant {
  label: string;
  price: number;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  variants?: MenuItemVariant[];
  tags: string[];
  imageUrl: string;
  available: boolean;
  order: number;
  group?: string;
  popular?: boolean;
  desc?: string;
}

export interface OrderItem {
  itemId: string;
  name: string;
  variant?: string;
  qty: number;
  price: number;
  notes?: string;
}

export interface OrderCustomer {
  name: string;
  phone: string;
  email: string;
  address?: string;
  street?: string;
  unit?: string;
  postalCode?: string;
  notes?: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  customer: OrderCustomer;
  type: "pickup" | "delivery";
  paymentMethod: "stripe" | "paypal" | "card" | "cash";
  paymentStatus: "pending" | "paid" | "failed";
  paymentRef?: string;
  orderStatus: OrderStatus;
  createdAt: any;
  notes?: string;
  orderNo?: string;
}

export interface Booking {
  id: string;
  name: string;
  phone: string;
  email: string;
  partySize: number;
  date: string;
  time: string;
  notes?: string;
  internalNotes?: string;
  status: BookingStatus;
  createdAt: any;
}

export interface GalleryImage {
  id: string;
  imageUrl: string;
  caption: string;
  order: number;
  storagePath?: string;
  src?: string;
}

export interface Review {
  id: string;
  name: string;
  stars: number;
  text: string;
  approved: boolean;
  createdAt: any;
  authorName?: string;
  dish?: string;
  rating?: number;
}

export interface StoreHour {
  day: string;
  days?: string;
  hours: string;
}

export interface PaymentSettings {
  enableStripe?: boolean;
  enablePayPal?: boolean;
}

export interface GeneralSettings {
  storeHours: StoreHour[];
  phone: string;
  email: string;
  address: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
  };
  heroHeadline: string;
  storyText: string;
  paymentSettings?: PaymentSettings;
}

export interface AdminUser {
  uid: string;
  email: string;
  role?: string;
  createdAt?: any;
}
