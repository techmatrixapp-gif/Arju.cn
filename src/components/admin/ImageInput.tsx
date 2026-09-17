import React, { useState, useRef } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";
import { Upload, Link as LinkIcon, X, Loader2 } from "lucide-react";

interface ImageInputProps {
  value: string;
  onChange: (url: string, storagePath?: string) => void;
  folder?: string;
  label?: string;
}

export default function ImageInput({
  value,
  onChange,
  folder = "uploads",
  label = "Image",
}: ImageInputProps) {
  const [tab, setTab] = useState<"url" | "upload">("url");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      setError("Image file size must be under 10MB.");
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const storagePath = `${folder}/${Date.now()}_${sanitizedName}`;
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const pct = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setProgress(pct);
        },
        (err) => {
          console.error("Storage upload error:", err);
          setError("Upload failed. Check storage permissions or paste an external image URL.");
          setUploading(false);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          onChange(downloadUrl, storagePath);
          setUploading(false);
          setProgress(100);
        }
      );
    } catch (err: any) {
      console.error("File upload error:", err);
      setError(err?.message || "Upload failed");
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs uppercase tracking-wider text-stone font-medium">
          {label}
        </label>
        <div className="flex items-center gap-1 bg-charcoal p-0.5 rounded border border-white/5 text-xs">
          <button
            type="button"
            onClick={() => setTab("url")}
            className={`px-2 py-0.5 rounded transition ${
              tab === "url"
                ? "bg-crimson text-cream font-medium"
                : "text-stone hover:text-cream"
            }`}
          >
            <span className="flex items-center gap-1">
              <LinkIcon className="w-3 h-3" /> URL
            </span>
          </button>
          <button
            type="button"
            onClick={() => setTab("upload")}
            className={`px-2 py-0.5 rounded transition ${
              tab === "upload"
                ? "bg-crimson text-cream font-medium"
                : "text-stone hover:text-cream"
            }`}
          >
            <span className="flex items-center gap-1">
              <Upload className="w-3 h-3" /> Upload
            </span>
          </button>
        </div>
      </div>

      {tab === "url" ? (
        <div className="relative">
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://images.pexels.com/..."
            className="w-full bg-coal border border-white/10 rounded px-3 py-2 text-sm text-cream placeholder:text-stone/50 focus:outline-none focus:border-crimson"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-white/15 hover:border-crimson/50 rounded-lg p-4 flex flex-col items-center justify-center gap-2 text-stone hover:text-cream bg-coal/50 transition cursor-pointer"
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-crimson" />
                <span className="text-xs text-cream">Uploading {progress}%...</span>
                <div className="w-48 bg-charcoal rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-crimson h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <>
                <Upload className="w-5 h-5 text-crimson" />
                <span className="text-xs">Click to browse image file</span>
                <span className="text-[10px] text-stone/60">JPG, PNG, WEBP up to 10MB</span>
              </>
            )}
          </button>
        </div>
      )}

      {error && <p className="text-xs text-crimson">{error}</p>}

      {/* Preview */}
      {value && (
        <div className="relative group w-24 h-24 rounded border border-white/10 overflow-hidden bg-charcoal mt-2">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = "none";
            }}
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-1 right-1 bg-black/80 hover:bg-crimson text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
            title="Remove image"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
