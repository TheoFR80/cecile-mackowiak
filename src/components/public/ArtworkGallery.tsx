"use client";

import Image from "next/image";
import { useState } from "react";
import type { ArtworkImage } from "@prisma/client";

type Props = {
  images: ArtworkImage[];
  title: string;
};

export function ArtworkGallery({ images, title }: Props) {
  const sorted = [...images].sort((a, b) => a.position - b.position);
  const [active, setActive] = useState(0);
  const current = sorted[active];

  if (!sorted.length) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center rounded-lg bg-stone-100 text-stone-400">
        Aucune photo
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-stone-100">
        {current?.url && (
          <Image
            src={current.url}
            alt={current.altText ?? title}
            fill
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        )}
      </div>
      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-20 w-16 shrink-0 overflow-hidden rounded border-2 ${
                i === active ? "border-ink" : "border-transparent"
              }`}
            >
              <Image
                src={img.url}
                alt=""
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
