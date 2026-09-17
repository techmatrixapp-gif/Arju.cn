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
import { db } from "../../firebase";
import type { Review } from "../../types/firestore";
import {
  Star,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isOpen, setIsOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formStars, setFormStars] = useState(5);
  const [formText, setFormText] = useState("");
  const [formApproved, setFormApproved] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setReviews(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Review)));
        setLoading(false);
      },
      (err) => {
        console.warn("Reviews listener error:", err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleToggleApproved = async (rev: Review) => {
    try {
      await updateDoc(doc(db, "reviews", rev.id), {
        approved: !rev.approved,
      });
    } catch (e) {
      console.error("Toggle review approval error:", e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "reviews", id));
      setDeleteConfirmId(null);
    } catch (e) {
      console.error("Delete review error:", e);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formText.trim()) return;
    setSaving(true);

    try {
      const id = `rev-${Date.now()}`;
      await setDoc(doc(db, "reviews", id), {
        id,
        name: formName.trim(),
        stars: Number(formStars),
        text: formText.trim(),
        approved: formApproved,
        createdAt: new Date().toISOString(),
      });
      setIsOpen(false);
      setFormName("");
      setFormText("");
      setFormStars(5);
      setFormApproved(true);
    } catch (err) {
      console.error("Add review error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-cream">
            Customer Reviews & Testimonials
          </h1>
          <p className="text-xs text-stone tracking-wider mt-1">
            Moderate public praise and add guest feedback
          </p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-crimson hover:bg-crimson-bright text-cream text-xs font-medium px-4 py-2.5 rounded-lg transition cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" /> Add Review
        </button>
      </div>

      {/* Reviews Table */}
      <div className="bg-coal border border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-stone">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-16 text-center text-stone text-xs">
            <Star className="w-8 h-8 mx-auto text-stone/40 mb-2" />
            No reviews found. Click "Add Review" or visit Settings to seed testimonials.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone">
              <thead className="bg-charcoal text-stone uppercase tracking-wider text-[10px] border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Guest</th>
                  <th className="py-3 px-4 w-28">Rating</th>
                  <th className="py-3 px-4">Review Text</th>
                  <th className="py-3 px-4 w-32 text-center">Approved / Live</th>
                  <th className="py-3 px-4 w-20 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-charcoal/40 transition">
                    <td className="py-3 px-4">
                      <span className="font-medium text-cream block">{rev.name}</span>
                      <span className="text-[10px] text-stone">
                        {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : ""}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.stars ? "fill-amber-400" : "text-stone/30"
                            }`}
                          />
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-cream">
                      <p className="line-clamp-2 italic">"{rev.text}"</p>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleApproved(rev)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                          rev.approved
                            ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                            : "bg-amber-500/15 text-amber-300 hover:bg-amber-500/25"
                        }`}
                      >
                        {rev.approved ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" /> Pending
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setDeleteConfirmId(rev.id)}
                        className="p-1.5 text-stone hover:text-crimson hover:bg-crimson/10 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Review Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-coal border border-white/15 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display font-bold text-lg text-cream">
                Add Customer Review
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-stone hover:text-cream"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddReview} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone mb-1 font-medium">
                  Reviewer Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. David M., Toronto"
                  className="w-full bg-charcoal border border-white/10 rounded-lg px-3 py-2 text-sm text-cream placeholder:text-stone/40 focus:outline-none focus:border-crimson"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-stone mb-1 font-medium">
                  Star Rating (1 - 5)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormStars(star)}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= formStars
                            ? "fill-amber-400 text-amber-400"
                            : "text-stone/40"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-cream ml-2 font-bold">{formStars} / 5</span>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-stone mb-1 font-medium">
                  Review Content *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  placeholder="Write the customer's quote..."
                  className="w-full bg-charcoal border border-white/10 rounded-lg px-3 py-2 text-sm text-cream placeholder:text-stone/40 focus:outline-none focus:border-crimson"
                />
              </div>

              <div className="flex items-center pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-cream">
                  <input
                    type="checkbox"
                    checked={formApproved}
                    onChange={(e) => setFormApproved(e.target.checked)}
                    className="rounded border-white/20 bg-charcoal text-crimson focus:ring-0 w-4 h-4"
                  />
                  <span>Publish directly to public testimonials</span>
                </label>
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
                  Save Review
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
              Delete Testimonial?
            </h4>
            <p className="text-xs text-stone">
              This review will be permanently removed from Firestore.
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
