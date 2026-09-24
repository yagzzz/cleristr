"use client";

import Image from "next/image";
import { Maximize2, Play, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type GalleryItem = {
  id: string;
  type: "image" | "video" | "document";
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
};

function posterFor(url: string) {
  if (url.includes("0221")) return "/media/reels/0221-poster.jpg";
  if (url.includes("0223")) return "/media/reels/0223-poster.jpg";
  return undefined;
}

export function ProductGallery({ items, productName }: { items: GalleryItem[]; productName: string }) {
  const [selected, setSelected] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const active = items[selected];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (lightboxOpen && !dialog.open) dialog.showModal();
    if (!lightboxOpen && dialog.open) dialog.close();
  }, [lightboxOpen]);

  if (!active) return <div className="aspect-[3/4] bg-stone" aria-label="Ürün görseli bulunmuyor" />;

  return (
    <div>
      <div className="relative aspect-[3/4] overflow-hidden bg-stone">
        {active.type === "video" ? (
          <video
            key={active.url}
            controls
            playsInline
            preload="metadata"
            poster={posterFor(active.url)}
            className="h-full w-full object-cover"
            aria-label={active.altText || `${productName} ürün videosu`}
          >
            <source src={active.url} type="video/mp4" />
            Tarayıcınız video etiketini desteklemiyor.
          </video>
        ) : (
          <>
            <Image
              src={active.url}
              alt={active.altText || productName}
              fill
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover"
              priority
            />
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="icon-button absolute bottom-4 right-4 bg-canvas/90 shadow-sm"
              aria-label="Görseli büyüt"
            >
              <Maximize2 aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      <div className="mt-3 flex snap-x gap-2 overflow-x-auto pb-2" aria-label="Ürün galerisi küçük görselleri">
        {items.map((item, index) => (
          <button
            type="button"
            key={item.id}
            onClick={() => setSelected(index)}
            className={`relative aspect-[3/4] w-20 shrink-0 snap-start overflow-hidden border-2 bg-stone ${selected === index ? "border-ink" : "border-transparent"}`}
            aria-label={`${index + 1}. ${item.type === "video" ? "videoyu" : "görseli"} göster`}
            aria-current={selected === index ? "true" : undefined}
          >
            {item.type === "video" ? (
              <>
                <Image src={posterFor(item.url) || "/media/products/baggy-esofman.webp"} alt="" fill sizes="80px" className="object-cover" />
                <span className="absolute inset-0 grid place-items-center bg-black/25 text-white"><Play aria-hidden="true" size={20} /></span>
              </>
            ) : (
              <Image src={item.url} alt="" fill sizes="80px" className="object-cover" />
            )}
          </button>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        className="m-auto max-h-[96vh] w-[min(96vw,1100px)] bg-transparent p-0 backdrop:bg-black/80"
        onClose={() => setLightboxOpen(false)}
        onCancel={() => setLightboxOpen(false)}
        onClick={(event) => {
          if (event.target === dialogRef.current) setLightboxOpen(false);
        }}
      >
        <div className="relative aspect-[3/4] max-h-[94vh] bg-stone">
          <Image src={active.url} alt={active.altText || productName} fill sizes="96vw" className="object-contain" />
          <button type="button" onClick={() => setLightboxOpen(false)} className="icon-button absolute right-3 top-3 bg-canvas" aria-label="Büyütülmüş görseli kapat">
            <X aria-hidden="true" />
          </button>
        </div>
      </dialog>
    </div>
  );
}
