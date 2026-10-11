"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductGallery({
  images,
  name,
}: {
  images: { url: string; alt?: string | null }[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active];
  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-border bg-black">
        {current ? (
          <Image src={current.url} alt={current.alt || name} fill className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" unoptimized={current.url.endsWith(".svg")} />
        ) : (
          <div className="grid h-full place-items-center text-muted">No image</div>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image.url + index}
              onClick={() => setActive(index)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border ${index === active ? "border-accent" : "border-border"}`}
              aria-label={`View image ${index + 1}`}
            >
              <Image src={image.url} alt="" fill className="object-cover" unoptimized={image.url.endsWith(".svg")} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
