"use client";

import { useCallback, useRef, useState } from "react";
import { CloudUpload, ImagePlus, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { uploadPropertyImages } from "@/lib/supabase/upload-property-images";

interface PropertyImageUploadZoneProps {
  onUploaded: (urls: string[]) => void;
  disabled?: boolean;
}

function filterImageFiles(fileList: FileList | File[]): File[] {
  return Array.from(fileList).filter((file) => file.type.startsWith("image/"));
}

export default function PropertyImageUploadZone({
  onUploaded,
  disabled = false,
}: PropertyImageUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const [lastSuccessCount, setLastSuccessCount] = useState(0);

  const handleFiles = useCallback(
    async (files: File[]) => {
      const images = filterImageFiles(files);
      if (images.length === 0) {
        toast.error("לא נמצאו קבצי תמונה תקינים");
        return;
      }

      setUploading(true);
      setUploadCount(images.length);
      setLastSuccessCount(0);

      try {
        const urls = await uploadPropertyImages(images);
        setLastSuccessCount(urls.length);
        onUploaded(urls);
        toast.success(`${urls.length} תמונות הועלו בהצלחה`, {
          icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "העלאת התמונות נכשלה");
      } finally {
        setUploading(false);
        setUploadCount(0);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [onUploaded]
  );

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;
    void handleFiles(Array.from(files));
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled || uploading) return;
    void handleFiles(Array.from(event.dataTransfer.files));
  };

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (!disabled && !uploading) inputRef.current?.click();
          }
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled && !uploading) setIsDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled && !uploading) setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={onDrop}
        onClick={() => {
          if (!disabled && !uploading) inputRef.current?.click();
        }}
        className={[
          "relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all",
          disabled || uploading ? "cursor-not-allowed opacity-60" : "hover:border-gold-500/50",
          isDragging
            ? "border-gold-500 bg-gold-500/10 shadow-lg shadow-gold-500/10"
            : "border-navy-200/70 bg-white/40 dark:border-white/15 dark:bg-white/5",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          disabled={disabled || uploading}
          onChange={onInputChange}
        />

        {uploading ? (
          <>
            <Loader2 className="mb-3 h-10 w-10 animate-spin text-gold-500" />
            <p className="font-display text-sm font-semibold text-slate-900 dark:text-white">
              מעלה תמונות...
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-white/50">
              {uploadCount} קבצים בדרך ל-Supabase Storage
            </p>
          </>
        ) : (
          <>
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gold-500/15 text-gold-600 dark:text-gold-300">
              {isDragging ? (
                <ImagePlus className="h-7 w-7" />
              ) : (
                <CloudUpload className="h-7 w-7" />
              )}
            </div>
            <p className="font-display text-sm font-semibold text-slate-900 dark:text-white">
              גררו תמונות לכאן או לחצו לבחירה
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-white/50">
              PNG, JPG, WEBP — עד 20 תמונות, 10MB לכל קובץ
            </p>
          </>
        )}
      </div>

      {lastSuccessCount > 0 && !uploading && (
        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-300">
          {lastSuccessCount} תמונות אחרונות נוספו לרשימת הנכס
        </p>
      )}
    </div>
  );
}
