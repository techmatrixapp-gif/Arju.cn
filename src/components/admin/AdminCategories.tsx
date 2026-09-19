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
import type { MenuCategory } from "../../types/firestore";
import {
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  FolderTree,
  Loader2,
  X,
  AlertTriangle,
} from "lucide-react";

export default function AdminCategories() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isOpen, setIsOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<MenuCategory | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formOrder, setFormOrder] = useState(1);
  const [formVisible, setFormVisible] = useState(true);
  const [formBlurb, setFormBlurb] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "menuCategories"), orderBy("order", "asc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as MenuCategory));
      setCategories(data);
      setLoading(false);
    }, (err) => {
      console.warn("Admin categories error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openAddModal = () => {
    setEditingCat(null);
    setFormName("");
    setFormOrder(categories.length + 1);
    setFormVisible(true);
    setFormBlurb("");
    setIsOpen(true);
  };

  const openEditModal = (cat: MenuCategory) => {
    setEditingCat(cat);
    setFormName(cat.name);
    setFormOrder(cat.order);
    setFormVisible(cat.visible);
    setFormBlurb(cat.blurb || "");
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    setSaving(true);

    try {
      const catData = {
        name: formName.trim(),
        order: Number(formOrder),
        sortOrder: Number(formOrder),
        visible: formVisible,
        blurb: formBlurb.trim(),
      };

      if (editingCat) {
        // Update both collections
        await updateDoc(doc(db, "menuCategories", editingCat.id), catData).catch(() => {});
        await setDoc(doc(db, "categories", editingCat.id), { id: editingCat.id, ...catData }, { merge: true });
      } else {
        // Create new in both
        const id = `cat-${Date.now()}`;
        await setDoc(doc(db, "menuCategories", id), { id, ...catData });
        await setDoc(doc(db, "categories", id), { id, ...catData });
      }
      setIsOpen(false);
    } catch (err) {
      console.error("Error saving category:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVisible = async (cat: MenuCategory) => {
    try {
      const nextVis = !cat.visible;
      await updateDoc(doc(db, "menuCategories", cat.id), { visible: nextVis }).catch(() => {});
      await setDoc(doc(db, "categories", cat.id), { visible: nextVis }, { merge: true });
    } catch (e) {
      console.error("Error toggling visibility:", e);
    }
  };

  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const currentCat = categories[index];
    const targetCat = categories[targetIndex];

    try {
      await updateDoc(doc(db, "menuCategories", currentCat.id), {
        order: targetCat.order,
        sortOrder: targetCat.order,
      }).catch(() => {});
      await setDoc(doc(db, "categories", currentCat.id), {
        order: targetCat.order,
        sortOrder: targetCat.order,
      }, { merge: true });

      await updateDoc(doc(db, "menuCategories", targetCat.id), {
        order: currentCat.order,
        sortOrder: currentCat.order,
      }).catch(() => {});
      await setDoc(doc(db, "categories", targetCat.id), {
        order: currentCat.order,
        sortOrder: currentCat.order,
      }, { merge: true });
    } catch (err) {
      console.error("Error swapping order:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "menuCategories", id)).catch(() => {});
      await deleteDoc(doc(db, "categories", id)).catch(() => {});
      setDeleteConfirmId(null);
    } catch (e) {
      console.error("Error deleting category:", e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-cream">
            Menu Categories
          </h1>
          <p className="text-xs text-stone tracking-wider mt-1">
            Organize tabs and dietary groups for dine-in & online ordering
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-crimson hover:bg-crimson-bright text-cream text-xs font-medium px-4 py-2.5 rounded-lg transition cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-coal border border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-stone flex flex-col items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-crimson" />
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center text-stone text-xs">
            <FolderTree className="w-8 h-8 mx-auto text-stone/40 mb-2" />
            No categories found. Click "Add Category" or visit Settings to seed defaults.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone">
              <thead className="bg-charcoal text-stone uppercase tracking-wider text-[10px] border-b border-white/10">
                <tr>
                  <th className="py-3 px-4 w-16 text-center">Order</th>
                  <th className="py-3 px-4">Name & Subtitle</th>
                  <th className="py-3 px-4 w-28 text-center">Visibility</th>
                  <th className="py-3 px-4 w-36 text-center">Reorder</th>
                  <th className="py-3 px-4 w-28 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {categories.map((cat, index) => (
                  <tr key={cat.id} className="hover:bg-charcoal/40 transition">
                    <td className="py-3 px-4 text-center font-semibold text-cream">
                      {cat.order}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-cream text-sm block">
                        {cat.name}
                      </span>
                      {cat.blurb && (
                        <span className="text-[11px] text-stone/80 block mt-0.5 line-clamp-1">
                          {cat.blurb}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleVisible(cat)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                          cat.visible
                            ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                            : "bg-stone/15 text-stone hover:bg-stone/25"
                        }`}
                      >
                        {cat.visible ? (
                          <>
                            <Eye className="w-3 h-3" /> Visible
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" /> Hidden
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          disabled={index === 0}
                          onClick={() => handleMoveOrder(index, "up")}
                          className="p-1.5 rounded bg-charcoal hover:bg-white/10 text-stone hover:text-cream disabled:opacity-30 disabled:cursor-not-allowed transition"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={index === categories.length - 1}
                          onClick={() => handleMoveOrder(index, "down")}
                          className="p-1.5 rounded bg-charcoal hover:bg-white/10 text-stone hover:text-cream disabled:opacity-30 disabled:cursor-not-allowed transition"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 text-stone hover:text-cream hover:bg-charcoal rounded transition"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(cat.id)}
                          className="p-1.5 text-stone hover:text-crimson hover:bg-crimson/10 rounded transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-coal border border-white/15 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display font-bold text-lg text-cream">
                {editingCat ? "Edit Category" : "Add New Category"}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-stone hover:text-cream"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone mb-1 font-medium">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Shawarma, Pizza & Pasta, Biryani"
                  className="w-full bg-charcoal border border-white/10 rounded-lg px-3 py-2 text-sm text-cream placeholder:text-stone/40 focus:outline-none focus:border-crimson"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-stone mb-1 font-medium">
                  Subtitle / Note
                </label>
                <input
                  type="text"
                  value={formBlurb}
                  onChange={(e) => setFormBlurb(e.target.value)}
                  placeholder="e.g. Slow-cooked, layered with aromatic rice"
                  className="w-full bg-charcoal border border-white/10 rounded-lg px-3 py-2 text-sm text-cream placeholder:text-stone/40 focus:outline-none focus:border-crimson"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone mb-1 font-medium">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formOrder}
                    onChange={(e) => setFormOrder(Number(e.target.value))}
                    className="w-full bg-charcoal border border-white/10 rounded-lg px-3 py-2 text-sm text-cream focus:outline-none focus:border-crimson"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-cream font-medium">
                    <input
                      type="checkbox"
                      checked={formVisible}
                      onChange={(e) => setFormVisible(e.target.checked)}
                      className="rounded border-white/20 bg-charcoal text-crimson focus:ring-0 w-4 h-4"
                    />
                    <span>Visible in Menu</span>
                  </label>
                </div>
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
                  {editingCat ? "Update Category" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-coal border border-crimson/40 rounded-xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-crimson/20 text-crimson mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="font-display font-bold text-base text-cream">
              Delete Menu Category?
            </h4>
            <p className="text-xs text-stone">
              Are you sure you want to delete this category? Items under this category will remain in the database.
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
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
