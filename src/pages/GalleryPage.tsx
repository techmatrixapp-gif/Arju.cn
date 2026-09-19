import { useState, useEffect, useMemo } from "react";
import Reveal from "../components/Reveal";
import { IMAGES } from "../data/content";
import { useGalleryImages } from "../services/firestoreData";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
} from "lucide-react";

interface GalleryPhoto {
  id: string;
  url: string;
  title: string;
  category: "food" | "ambience" | "kitchen" | "drinks";
  caption?: string;
}

const STATIC_GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    id: "g-1",
    url: "https://images.pexels.com/photos/17650170/pexels-photo-17650170.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=800",
    title: "Signature Chicken Shawarma Plate",
    category: "food",
    caption: "Spit-roasted chicken with saffron rice, garlic toum, and pickled wild turnips.",
  },
  {
    id: "g-2",
    url: "https://images.pexels.com/photos/29631417/pexels-photo-29631417.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=800",
    title: "Handi Dum Biryani",
    category: "food",
    caption: "Slow-cooked under dough seal with aromatic Basmati and saffron threads.",
  },
  {
    id: "g-3",
    url: "https://images.pexels.com/photos/28945103/pexels-photo-28945103.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=800",
    title: "Woodstone Artisan Pizza",
    category: "food",
    caption: "48-hour cold fermented dough topped with San Marzano tomatoes and fior di latte.",
  },
  {
    id: "g-4",
    url: "https://images.pexels.com/photos/29039081/pexels-photo-29039081.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=800",
    title: "Penne all'Arrabbiata",
    category: "food",
    caption: "Bronze-cut pasta tossed in blistering chilies, garlic confit, and basil.",
  },
  {
    id: "g-5",
    url: IMAGES.visit,
    title: "Warm Evening Dining Room",
    category: "ambience",
    caption: "Intimate seating on Yonge Street with ambient warm amber lighting.",
  },
  {
    id: "g-6",
    url: IMAGES.chef,
    title: "Screaming-Hot Wok Station",
    category: "kitchen",
    caption: "Chef commanding the woks with high-heat wok hei technique.",
  },
  {
    id: "g-7",
    url: IMAGES.story,
    title: "Handmade Artisanal Crust",
    category: "kitchen",
    caption: "Natural sourdough preparation with heritage Canadian grains.",
  },
  {
    id: "g-8",
    url: "https://images.pexels.com/photos/29631426/pexels-photo-29631426.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=800",
    title: "Crispy Chilli Chicken",
    category: "food",
    caption: "Wok-tossed with scallions, green chilies, and tangy dark glaze.",
  },
];

export default function GalleryPage() {
  const { images: firestoreGallery } = useGalleryImages();
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    document.title = "Visual Gallery — Dishes, Craft & Atmosphere | ARJU Toronto";
  }, []);

  // Merge Firestore gallery if available, otherwise use static
  const allPhotos: GalleryPhoto[] = useMemo(() => {
    if (firestoreGallery && firestoreGallery.length > 0) {
      return firestoreGallery.map((fg: any, idx: number) => ({
        id: fg.id || `fg-${idx}`,
        url: fg.imageUrl,
        title: fg.title || "ARJU Culinary Moment",
        category: (fg.category as any) || "food",
        caption: fg.caption || fg.title || "",
      }));
    }
    return STATIC_GALLERY_PHOTOS;
  }, [firestoreGallery]);

  const filteredPhotos = useMemo(() => {
    if (selectedFilter === "all") return allPhotos;
    return allPhotos.filter((p) => p.category === selectedFilter);
  }, [allPhotos, selectedFilter]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) =>
          prev !== null ? (prev === 0 ? filteredPhotos.length - 1 : prev - 1) : null
        );
      }
      if (e.key === "ArrowRight") {
        setLightboxIndex((prev) =>
          prev !== null ? (prev === filteredPhotos.length - 1 ? 0 : prev + 1) : null
        );
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, filteredPhotos.length]);

  return (
    <div className="pt-28 pb-20 bg-ink text-cream">
      {/* Page Header */}
      <section className="relative px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto text-center border-b border-white/10 pb-14">
        <Reveal>
          <div className="flex items-center justify-center gap-3 text-crimson-bright mb-3">
            <span className="h-px w-8 bg-crimson" />
            <span className="text-[11px] tracking-[0.35em] uppercase font-semibold">
              The ARJU Atmosphere
            </span>
            <span className="h-px w-8 bg-crimson" />
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-cream">
            Visual Gallery
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-stone text-sm sm:text-base leading-relaxed">
            A visual journey through our kitchen fires, artisanal dough crafting, and the vibrant
            dining room energy on Yonge Street.
          </p>
        </Reveal>

        {/* Filter Pills */}
        <Reveal delay={150}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {[
              { id: "all", label: "All Moments" },
              { id: "food", label: "Dishes & Signatures" },
              { id: "ambience", label: "Dining Room" },
              { id: "kitchen", label: "Kitchen Fire & Craft" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer border ${
                  selectedFilter === f.id
                    ? "border-crimson bg-crimson text-cream shadow-sm"
                    : "border-white/15 bg-white/5 text-stone hover:text-cream hover:border-white/30"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Grid of Images */}
      <section className="px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPhotos.map((photo, index) => (
            <div
              key={photo.id}
              onClick={() => setLightboxIndex(index)}
              className="group relative h-80 overflow-hidden border border-white/10 bg-coal cursor-pointer"
            >
              <img
                src={photo.url}
                alt={photo.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

              <div className="absolute bottom-0 inset-x-0 p-5 transform transition-transform duration-300">
                <span className="text-[10px] uppercase tracking-widest text-crimson-bright font-bold block mb-1">
                  {photo.category}
                </span>
                <h3 className="font-display text-lg font-bold text-cream group-hover:text-crimson-bright transition-colors">
                  {photo.title}
                </h3>
                {photo.caption && (
                  <p className="mt-1 text-xs text-stone line-clamp-2">{photo.caption}</p>
                )}
              </div>

              <div className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-cream opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LIGHTBOX MODAL */}
      {lightboxIndex !== null && filteredPhotos[lightboxIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md">
          {/* Close button */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-6 right-6 z-10 flex h-11 w-11 items-center justify-center border border-white/20 bg-ink/60 text-cream hover:border-crimson-bright transition-colors cursor-pointer"
            aria-label="Close image preview"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Left Arrow */}
          <button
            onClick={() =>
              setLightboxIndex((prev) =>
                prev !== null ? (prev === 0 ? filteredPhotos.length - 1 : prev - 1) : null
              )
            }
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center border border-white/20 bg-ink/60 text-cream hover:border-crimson-bright transition-colors cursor-pointer"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() =>
              setLightboxIndex((prev) =>
                prev !== null ? (prev === filteredPhotos.length - 1 ? 0 : prev + 1) : null
              )
            }
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center border border-white/20 bg-ink/60 text-cream hover:border-crimson-bright transition-colors cursor-pointer"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Image Container */}
          <div className="max-w-4xl max-h-[85vh] flex flex-col items-center">
            <img
              src={filteredPhotos[lightboxIndex].url}
              alt={filteredPhotos[lightboxIndex].title}
              className="max-h-[70vh] w-auto object-contain border border-white/10 shadow-2xl"
            />
            <div className="mt-4 text-center">
              <h3 className="font-display text-xl font-bold text-cream">
                {filteredPhotos[lightboxIndex].title}
              </h3>
              {filteredPhotos[lightboxIndex].caption && (
                <p className="mt-1 text-sm text-stone max-w-lg">
                  {filteredPhotos[lightboxIndex].caption}
                </p>
              )}
              <span className="mt-2 text-[11px] text-stone/70 tracking-widest uppercase block">
                {lightboxIndex + 1} of {filteredPhotos.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
