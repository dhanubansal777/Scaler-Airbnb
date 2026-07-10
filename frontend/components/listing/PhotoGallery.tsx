"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Grid3x3 } from "lucide-react";
import type { ListingPhoto } from "@/lib/types";

export default function PhotoGallery({ photos, title }: { photos: ListingPhoto[]; title: string }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const images = photos.length > 0 ? photos : [{ id: 0, url: "", sort_order: 0 }];

  return (
    <div className="relative">
      <div className="grid h-[60vh] max-h-[520px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl">
        <button
          onClick={() => setLightboxIndex(0)}
          className="relative col-span-4 row-span-2 bg-muted/20 sm:col-span-2"
        >
          {images[0]?.url && <img src={images[0].url} alt={title} className="h-full w-full object-cover" />}
        </button>
        {images.slice(1, 5).map((photo, idx) => (
          <button
            key={photo.id}
            onClick={() => setLightboxIndex(idx + 1)}
            className="relative hidden bg-muted/20 sm:block"
          >
            <img src={photo.url} alt={title} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>

      {photos.length > 1 && (
        <button
          onClick={() => setLightboxIndex(0)}
          className="absolute bottom-4 right-4 hidden items-center gap-2 rounded-lg border border-foreground bg-card px-4 py-2 text-sm font-semibold shadow sm:flex"
        >
          <Grid3x3 size={14} /> Show all photos
        </button>
      )}

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      )}
    </div>
  );
}

function Lightbox({
  images,
  index,
  onClose,
  onIndexChange,
}: {
  images: ListingPhoto[];
  index: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex items-center justify-between p-4">
        <button onClick={onClose} className="rounded-full p-2 text-white hover:bg-white/10" aria-label="Close">
          <X size={22} />
        </button>
        <span className="text-sm text-white/80">
          {index + 1} / {images.length}
        </span>
      </div>
      <div className="relative flex flex-1 items-center justify-center px-4 pb-4">
        {images[index]?.url && (
          <img src={images[index].url} alt="" className="max-h-full max-w-full rounded-lg object-contain" />
        )}
        {images.length > 1 && (
          <>
            <button
              onClick={() => onIndexChange((index - 1 + images.length) % images.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => onIndexChange((index + 1) % images.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
