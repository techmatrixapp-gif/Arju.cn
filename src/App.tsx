import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminAuthProvider } from "./context/AdminAuthContext";

// Public Layout and Pages
import PublicLayout from "./layouts/PublicLayout";
import HomePage from "./pages/HomePage";
import MenuPage from "./pages/MenuPage";
import BookingPage from "./pages/BookingPage";
import AboutPage from "./pages/AboutPage";
import GalleryPage from "./pages/GalleryPage";
import ContactPage from "./pages/ContactPage";

// Admin components
import AdminLogin from "./components/admin/AdminLogin";
import AdminLayout, { RequireAdmin } from "./components/admin/AdminLayout";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminCategories from "./components/admin/AdminCategories";
import AdminMenuItems from "./components/admin/AdminMenuItems";
import AdminOrders from "./components/admin/AdminOrders";
import AdminBookings from "./components/admin/AdminBookings";
import AdminGallery from "./components/admin/AdminGallery";
import AdminReviews from "./components/admin/AdminReviews";
import AdminSettings from "./components/admin/AdminSettings";
import AdminContentCMS from "./components/admin/AdminContentCMS";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public customer-facing website with persistent layout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/reservations" element={<Navigate to="/booking" replace />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/story" element={<Navigate to="/about" replace />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/visit" element={<Navigate to="/contact" replace />} />
        </Route>

        {/* Admin Login */}
        <Route
          path="/admin/login"
          element={
            <AdminAuthProvider>
              <AdminLogin />
            </AdminAuthProvider>
          }
        />

        {/* Protected Admin Panel */}
        <Route
          path="/admin"
          element={
            <AdminAuthProvider>
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            </AdminAuthProvider>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="menu/categories" element={<AdminCategories />} />
          <Route path="categories" element={<Navigate to="/admin/menu/categories" replace />} />
          <Route path="menu/items" element={<AdminMenuItems />} />
          <Route path="items" element={<Navigate to="/admin/menu/items" replace />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="content" element={<AdminContentCMS />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Fallback to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
