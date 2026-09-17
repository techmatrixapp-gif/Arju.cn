import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import type { MenuItem, MenuCategory, MenuItemVariant } from "../../types/firestore";
import ImageInput from "./ImageInput";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function AdminMenuItems() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formAvailable, setFormAvailable] = useState(true);
  const [formPopular, setFormPopular] = useState(false);
  const [formTags, setFormTags] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formVariants, setFormVariants] = useState<MenuItemVariant[]>([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    // Categories
    const unsubCats = onSnapshot(
      query(collection(db, "menuCategories"), orderBy("order", "asc")),
      (snap) => {
        setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() } as MenuCategory)));
      }
    );

    // Items
    const unsubItems = onSnapshot(
      query(collection(db, "menuItems"), orderBy("order", "asc")),
      (snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as MenuItem)));
        setLoading(false);
      },
      (err) => {
        console.warn("Menu items error:", err);
        setLoading(false);
      }
    );

    return () => {
      unsubCats();
      unsubItems();
    };
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormName("");
    setFormDesc("");
    setFormCategory(categories[0]?.id || "");
    setFormPrice(12.99);
    setFormAvailable(true);
    setFormPopular(false);
    setFormTags("");
    setFormImageUrl("");
    setFormVariants([]);
    setFormError(null);
    setIsOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormDesc(item.description || "");
    setFormCategory(item.categoryId || categories[0]?.id || "");
    setFormPrice(item.price || 0);
    setFormAvailable(item.available !== false);
    setFormPopular(!!item.popular);
    setFormTags((item.tags || []).join(", "));
    setFormImageUrl(item.imageUrl || "");
    setFormVariants(item.variants || []);
    setFormError(null);
    setIsOpen(true);
  };

  // Variants handlers
  const addVariantRow = () => {
    setFormVariants([...formVariants, { label: "", price: formPrice || 0 }]);
  };

  const updateVariantRow = (index: number, field: "label" | "price", val: any) => {
    const updated = [...formVariants];
    if (field === "price") {
      updated[index].price = parseFloat(val) || 0;
    } else {
      updated[index].label = val;
    }
    setFormVariants(updated);
  };

  const removeVariantRow = (index: number) => {
    setFormVariants(formVariants.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError("Item name is required.");
      return;
    }
    if (formPrice < 0) {
      setFormError("Price cannot be negative.");
      return;
    }

    setSaving(true);
    setFormError(null);

    const tagsArray = formTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      if (editingItem) {
        await updateDoc(doc(db, "menuItems", editingItem.id), {
          name: formName.trim(),
          description: formDesc.trim(),
          categoryId: formCategory,
          price: Number(formPrice),
          available: formAvailable,
          popular: formPopular,
          tags: tagsArray,
          imageUrl: formImageUrl.trim(),
          variants: formVariants.filter((v) => v.label.trim()),
        });
      } else {
        const id = `item-${Date.now()}`;
        await setDoc(doc(db, "menuItems", id), {
          id,
          name: formName.trim(),
          description: formDesc.trim(),
          categoryId: formCategory,
          price: Number(formPrice),
          available: formAvailable,
          popular: formPopular,
          tags: tagsArray,
          imageUrl: formImageUrl.trim(),
          variants: formVariants.filter((v) => v.label.trim()),
          order: items.length + 1,
        });
      }
      setIsOpen(false);
    } catch (err: any) {
      console.error("Save item error:", err);
      setFormError(err?.message || "Failed to save item.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailable = async (item: MenuItem) => {
    try {
      await updateDoc(doc(db, "menuItems", item.id), {
        available: !item.available,
      });
    } catch (e) {
      console.error("Toggle available error:", e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "menuItems", id));
      setDeleteConfirmId(null);
    } catch (e) {
      console.error("Delete item error:", e);
    }
  };

  // Filtered list
  const filteredItems = items.filter((item) => {
    const matchesCat =
      selectedCategory === "all" || item.categoryId === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-cream">
            Menu Items
          </h1>
          <p className="text-xs text-stone tracking-wider mt-1">
            Manage dishes, prices, sizes/variants, ingredients, and photos
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-crimson hover:bg-crimson-bright text-cream text-xs font-medium px-4 py-2.5 rounded-lg transition cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" /> Add Menu Item
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-coal border border-white/10 p-3 rounded-xl">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              selectedCategory === "all"
                ? "bg-crimson text-cream"
                : "text-stone hover:text-cream bg-charcoal"
            }`}
          >
            All Items ({items.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? "bg-crimson text-cream"
                  : "text-stone hover:text-cream bg-charcoal"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-stone/60 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search dish or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-charcoal border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-cream placeholder:text-stone/40 focus:outline-none focus:border-crimson"
          />
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-coal border border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-stone flex flex-col items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-crimson" />
            Loading menu items...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center text-stone text-xs">
            No dishes matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone">
              <thead className="bg-charcoal text-stone uppercase tracking-wider text-[10px] border-b border-white/10">
                <tr>
                  <th className="py-3 px-4 w-16">Image</th>
                  <th className="py-3 px-4">Item Details</th>
                  <th className="py-3 px-4 w-32">Category</th>
                  <th className="py-3 px-4 w-24">Price</th>
                  <th className="py-3 px-4 w-28 text-center">Availability</th>
                  <th className="py-3 px-4 w-24 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredItems.map((item) => {
                  const catName =
                    categories.find((c) => c.id === item.categoryId)?.name ||
                    item.categoryId;

                  return (
                    <tr key={item.id} className="hover:bg-charcoal/40 transition">
                      <td className="py-3 px-4">
                        <div className="w-12 h-12 rounded-lg bg-charcoal border border-white/10 overflow-hidden flex items-center justify-center">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[10px] text-stone/40">No photo</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-cream text-sm">
                            {item.name}
                          </span>
                          {item.popular && (
                            <span className="bg-crimson/20 text-crimson-bright text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                              Popular
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-stone text-[11px] mt-0.5 line-clamp-1">
                            {item.description}
                          </p>
                        )}
                        {/* Tags & variants indicator */}
                        <div className="flex items-center gap-1.5 mt-1">
                          {item.tags?.map((tag) => (
                            <span
                              key={tag}
                              className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-stone"
                            >
                              {tag}
                            </span>
                          ))}
                          {item.variants && item.variants.length > 0 && (
                            <span className="text-[10px] text-stone/70 italic">
                              • {item.variants.length} sizes
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-stone text-xs font-medium">
                        {catName}
                      </td>
                      <td className="py-3 px-4 font-bold text-cream">
                        ${Number(item.price).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleAvailable(item)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                            item.available
                              ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                              : "bg-crimson/15 text-crimson hover:bg-crimson/25"
                          }`}
                        >
                          {item.available ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> In Stock
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" /> Sold Out
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 text-stone hover:text-cream hover:bg-charcoal rounded transition"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="p-1.5 text-stone hover:text-crimson hover:bg-crimson/10 rounded transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-coal border border-white/15 rounded-xl max-w-xl w-full p-6 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display font-bold text-lg text-cream">
                {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-stone hover:text-cream"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-crimson/10 border border-crimson/30 rounded-lg text-xs text-cream flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-crimson shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone mb-1 font-medium">
                    Dish Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Chicken Dum Biryani"
                    className="w-full bg-charcoal border border-white/10 rounded-lg px-3 py-2 text-sm text-cream placeholder:text-stone/40 focus:outline-none focus:border-crimson"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone mb-1 font-medium">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-charcoal border border-white/10 rounded-lg px-3 py-2 text-sm text-cream focus:outline-none focus:border-crimson"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-stone mb-1 font-medium">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Ingredients, preparation, spices..."
                  className="w-full bg-charcoal border border-white/10 rounded-lg px-3 py-2 text-sm text-cream placeholder:text-stone/40 focus:outline-none focus:border-crimson"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone mb-1 font-medium">
                    Base Price (CAD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-charcoal border border-white/10 rounded-lg px-3 py-2 text-sm text-cream focus:outline-none focus:border-crimson"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone mb-1 font-medium">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="V, Spicy, Popular"
                    className="w-full bg-charcoal border border-white/10 rounded-lg px-3 py-2 text-sm text-cream placeholder:text-stone/40 focus:outline-none focus:border-crimson"
                  />
                </div>

                <div className="flex flex-col justify-end gap-1.5 pb-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-cream">
                    <input
                      type="checkbox"
                      checked={formAvailable}
                      onChange={(e) => setFormAvailable(e.target.checked)}
                      className="rounded border-white/20 bg-charcoal text-crimson focus:ring-0 w-3.5 h-3.5"
                    />
                    <span>Available / In Stock</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-cream">
                    <input
                      type="checkbox"
                      checked={formPopular}
                      onChange={(e) => setFormPopular(e.target.checked)}
                      className="rounded border-white/20 bg-charcoal text-crimson focus:ring-0 w-3.5 h-3.5"
                    />
                    <span>Featured / Popular</span>
                  </label>
                </div>
              </div>

              {/* Shared ImageInput for Storage Upload or External URL */}
              <ImageInput
                value={formImageUrl}
                onChange={(url) => setFormImageUrl(url)}
                folder="menu_items"
                label="Food Photo (Direct Upload or URL)"
              />

              {/* Variants / Portion Sizes */}
              <div className="border-t border-white/10 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-stone font-medium">
                    Portion Sizes / Variants (Optional)
                  </span>
                  <button
                    type="button"
                    onClick={addVariantRow}
                    className="text-xs text-crimson hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Size
                  </button>
                </div>

                {formVariants.length > 0 ? (
                  <div className="space-y-2">
                    {formVariants.map((v, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Label (e.g. Regular, Large, Medium)"
                          value={v.label}
                          onChange={(e) => updateVariantRow(idx, "label", e.target.value)}
                          className="flex-1 bg-charcoal border border-white/10 rounded px-2.5 py-1.5 text-xs text-cream focus:outline-none focus:border-crimson"
                        />
                        <div className="w-28 relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-stone text-xs">
                            $
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            value={v.price}
                            onChange={(e) => updateVariantRow(idx, "price", e.target.value)}
                            className="w-full bg-charcoal border border-white/10 rounded pl-6 pr-2 py-1.5 text-xs text-cream focus:outline-none focus:border-crimson"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeVariantRow(idx)}
                          className="p-1 text-stone hover:text-crimson"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-stone/60">
                    No variants added. Base price (${formPrice.toFixed(2)}) will apply.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-stone hover:text-cream bg-charcoal transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-cream bg-crimson hover:bg-crimson-bright transition flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingItem ? "Save Changes" : "Create Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Item Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-coal border border-crimson/40 rounded-xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-crimson/20 text-crimson mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="font-display font-bold text-base text-cream">
              Remove this Menu Item?
            </h4>
            <p className="text-xs text-stone">
              This action cannot be undone. The dish will no longer appear on dine-in or online menus.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-charcoal text-xs text-stone hover:text-cream rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 bg-crimson hover:bg-crimson-bright text-xs text-cream font-medium rounded-lg transition"
              >
                Yes, Remove Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
