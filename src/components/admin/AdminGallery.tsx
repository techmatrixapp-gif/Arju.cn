import React, { useState, useEffect } from "react";
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
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "../../firebase";
import type { GalleryImage } from "../../types/firestore";
import ImageInput from "./ImageInput";
import {
  Plus,
  Trash2,
  Edit2,
  X,
  Loader2,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
} from "lucide-react";

export default function AdminGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isOpen, setIsOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formStoragePath, setFormStoragePath] = useState<string | undefined>(undefined);
  const [formCaption, setFormCaption] = useState("");
  const [formOrder, setFormOrder] = useState(1);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "gallery"), orderBy("order", "asc"));
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setImages(snap.docs.map((d) => ({ id: d.id, ...d.data() } as GalleryImage)));
        setLoading(false);
      },
      (err) => {
        console.warn("Gallery error:", err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const openAddModal = () => {
    setEditingImage(null);
    setFormImageUrl("");
    setFormStoragePath(undefined);
    setFormCaption("");
    setFormOrder(images.length + 1);
    setFormError(null);
    setIsOpen(true);
  };

  const openEditModal = (img: GalleryImage) => {
    setEditingImage(img);
    setFormImageUrl(img.imageUrl);
    setFormStoragePath(img.storagePath);
    setFormCaption(img.caption);
    setFormOrder(img.order);
    setFormError(null);
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formImageUrl.trim()) {
      setFormError("Please provide an image file or URL.");
      return;
    }
    setSaving(true);
    setFormError(null);

    try {
      if (editingImage) {
        await updateDoc(doc(db, "gallery", editingImage.id), {
          imageUrl: formImageUrl.trim(),
          storagePath: formStoragePath || editingImage.storagePath || "",
          caption: formCaption.trim(),
          order: Number(formOrder),
        });
      } else {
        const id = `gal-${Date.now()}`;
        await setDoc(doc(db, "gallery", id), {
          id,
          imageUrl: formImageUrl.trim(),
          storagePath: formStoragePath || "",
          caption: formCaption.trim(),
          order: Number(formOrder),
        });
      }
      setIsOpen(false);
    } catch (err: any) {
      setFormError(err?.message || "Failed to save image.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const target = images.find((img) => img.id === id);
    try {
      // If it has a storagePath, clean up from Firebase Storage
      if (target?.storagePath) {
        try {
          const fileRef = ref(storage, target.storagePath);
          await deleteObject(fileRef);
        } catch (storageErr) {
          console.warn("Could not delete from storage bucket:", storageErr);
        }
      }
      await deleteDoc(doc(db, "gallery", id));
      setDeleteConfirmId(null);
    } catch (e) {
      console.error("Delete gallery error:", e);
    }
  };

  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const currentImg = images[index];
    const targetImg = images[targetIndex];

    try {
      await updateDoc(doc(db, "gallery", currentImg.id), {
        order: targetImg.order,
      });
      await updateDoc(doc(db, "gallery", targetImg.id), {
        order: currentImg.order,
      });
    } catch (err) {
      console.error("Reorder gallery error:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-cream">
            Restaurant Gallery
          </h1>
          <p className="text-xs text-stone tracking-wider mt-1">
            Showcase interior atmosphere, culinary craft, and dining moments
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-crimson hover:bg-crimson-bright text-cream text-xs font-medium px-4 py-2.5 rounded-lg transition cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" /> Add Photo
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-stone flex flex-col items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-crimson" />
          Loading gallery photos...
        </div>
      ) : images.length === 0 ? (
        <div className="bg-coal border border-white/10 rounded-xl p-12 text-center text-stone text-xs">
          <ImageIcon className="w-8 h-8 mx-auto text-stone/40 mb-2" />
          No gallery images found. Click "Add Photo" to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, index) => (
            <div
              key={img.id}
              className="group bg-coal border border-white/10 rounded-xl overflow-hidden flex flex-col justify-between"
            >
              <div className="relative aspect-[4/3] bg-charcoal overflow-hidden">
                <img
                  src={img.imageUrl}
                  alt={img.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold text-cream">
                  #{img.order}
                </div>
              </div>

              <div className="p-3.5 space-y-2">
                <p className="text-xs text-cream font-medium line-clamp-2">
                  {img.caption || "Untitled photograph"}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex items-center gap-1">
                    <button
                      disabled={index === 0}
                      onClick={() => handleMoveOrder(index, "up")}
                      className="p-1 rounded bg-charcoal hover:bg-white/10 text-stone hover:text-cream disabled:opacity-30 transition"
                      title="Move earlier"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      disabled={index === images.length - 1}
                      onClick={() => handleMoveOrder(index, "down")}
                      className="p-1 rounded bg-charcoal hover:bg-white/10 text-stone hover:text-cream disabled:opacity-30 transition"
                      title="Move later"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(img)}
                      className="p-1.5 text-stone hover:text-cream hover:bg-charcoal rounded transition"
                      title="Edit caption"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(img.id)}
                      className="p-1.5 text-stone hover:text-crimson hover:bg-crimson/10 rounded transition"
                      title="Delete photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-coal border border-white/15 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display font-bold text-lg text-cream">
                {editingImage ? "Edit Gallery Photo" : "Add Gallery Photo"}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-stone hover:text-cream"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-crimson/10 border border-crimson/30 rounded-lg text-xs text-cream">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <ImageInput
                value={formImageUrl}
                onChange={(url, path) => {
                  setFormImageUrl(url);
                  if (path) setFormStoragePath(path);
                }}
                folder="gallery"
                label="Photo (Direct Upload or External URL)"
              />

              <div>
                <label className="block text-xs uppercase tracking-wider text-stone mb-1 font-medium">
                  Caption / Title *
                </label>
                <input
                  type="text"
                  required
                  value={formCaption}
                  onChange={(e) => setFormCaption(e.target.value)}
                  placeholder="e.g. Wok-tossed Hakka noodles, candlelit corner booth"
                  className="w-full bg-charcoal border border-white/10 rounded-lg px-3 py-2 text-sm text-cream placeholder:text-stone/40 focus:outline-none focus:border-crimson"
                />
              </div>

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
                  {editingImage ? "Update Photo" : "Add to Gallery"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-coal border border-crimson/40 rounded-xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-crimson/20 text-crimson mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="font-display font-bold text-base text-cream">
              Delete Gallery Photo?
            </h4>
            <p className="text-xs text-stone">
              This photo will be removed from the gallery and its file deleted if uploaded to storage.
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
