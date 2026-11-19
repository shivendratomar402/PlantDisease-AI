"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, ImageIcon, X, Loader2, Leaf } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface Props {
  onResult: (data: PredictionResult) => void;
  onLoading: (loading: boolean) => void;
}

export interface PredictionResult {
  success: boolean;
  cls: string;
  pathogen: string;
  confidence: number;
  severity: string;
  treatment: string;
  all_scores: Record<string, number>;
  imageUrl: string;
}

export function UploadDropzone({ onResult, onLoading }: Props) {
  const { theme } = useTheme();
  const dark = theme === "dark";
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(
    async (file: File) => {
      const allowed = ["image/jpeg", "image/png", "image/webp"];
      if (!allowed.includes(file.type)) {
        setError("Please upload a JPG, PNG or WebP image.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("This image is larger than 10 MB. Choose a smaller image.");
        return;
      }
      setError(null);
      if (preview) URL.revokeObjectURL(preview);
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      setLoading(true);
      onLoading(true);

      const form = new FormData();
      form.append("file", file);

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://plantdisease-ai-dyq4.onrender.com/predict";
        const res = await fetch(apiUrl, {
          method: "POST",
          body: form,
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || "Prediction failed.");
        }
        const data = await res.json();
        onResult({ ...data, imageUrl: objectUrl });
      } catch (e: any) {
        setError(e.message || "Could not connect to the AI server.");
      } finally {
        setLoading(false);
        onLoading(false);
      }
    },
    [onResult, onLoading, preview]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const clear = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <motion.div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => !preview && inputRef.current?.click()}
        animate={{
          scale: isDragging ? 1.02 : 1,
          borderColor: isDragging
            ? "rgba(52,211,153,0.8)"
            : dark
            ? "rgba(255,255,255,0.12)"
            : "rgba(0,0,0,0.12)",
        }}
        transition={{ duration: 0.2 }}
        className={`
          relative rounded-2xl border-2 border-dashed transition-all overflow-hidden
          ${!preview ? "cursor-pointer" : ""}
          ${dark ? "glass" : "glass-light"}
          ${isDragging ? "shadow-[0_0_30px_rgba(52,211,153,0.2)]" : ""}
        `}
        style={{ minHeight: 280 }}
      >
        {/* Input */}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) processFile(file);
          }}
        />

        <AnimatePresence mode="wait">
          {/* Loading overlay */}
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm"
            >
              <Loader2 className="text-emerald-400 animate-spin" size={48} />
              <p className="mt-4 text-emerald-300 font-medium text-lg">
                Analyzing leaf…
              </p>
              <p className="text-sm text-gray-400 mt-1">Running CNN inference</p>
            </motion.div>
          )}

          {/* Image preview */}
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <img
                src={preview}
                alt="Leaf preview"
                className="w-full max-h-72 object-contain p-4"
              />
              <button
                onClick={(e) => { e.stopPropagation(); clear(); }}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-red-500/20 border border-red-500/30 hover:bg-red-500/40 transition text-red-400"
              >
                <X size={16} />
              </button>
              <div
                onClick={() => inputRef.current?.click()}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 cursor-pointer px-4 py-1.5 rounded-full text-xs font-medium bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 hover:bg-emerald-500/30 transition"
              >
                Change image
              </div>
            </motion.div>
          ) : (
            /* Empty state */
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 px-6 text-center select-none"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                className={`
                  p-5 rounded-2xl mb-5
                  ${dark ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-emerald-100 border border-emerald-200"}
                `}
              >
                <Leaf className="text-emerald-400" size={40} />
              </motion.div>
              <p className={`text-lg font-semibold mb-1 ${dark ? "text-white" : "text-gray-800"}`}>
                Drop a leaf image here
              </p>
              <p className={`text-sm mb-6 ${dark ? "text-gray-400" : "text-gray-500"}`}>
                or click to browse from your device
              </p>
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 transition text-white text-sm font-medium shadow-lg shadow-emerald-500/20">
                <Upload size={16} />
                <span>Select Image</span>
              </div>
              <p className={`text-xs mt-4 ${dark ? "text-gray-500" : "text-gray-400"}`}>
                Supports JPEG, PNG &amp; WebP · Max 10 MB
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-sm text-red-400 text-center"
          >
            ⚠ {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
