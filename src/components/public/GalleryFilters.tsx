"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  categories: string[];
  techniques: string[];
};

export function GalleryFilters({ categories, techniques }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/galerie?${next.toString()}`);
  }

  return (
    <div className="mt-8 flex flex-wrap gap-4">
      <select
        aria-label="Catégorie"
        className="rounded-lg border border-stone-300 px-4 py-2 text-sm"
        value={params.get("category") ?? ""}
        onChange={(e) => update("category", e.target.value)}
      >
        <option value="">Toutes catégories</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <select
        aria-label="Technique"
        className="rounded-lg border border-stone-300 px-4 py-2 text-sm"
        value={params.get("technique") ?? ""}
        onChange={(e) => update("technique", e.target.value)}
      >
        <option value="">Toutes techniques</option>
        {techniques.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <select
        aria-label="Tri"
        className="rounded-lg border border-stone-300 px-4 py-2 text-sm"
        value={params.get("sort") ?? "recent"}
        onChange={(e) => update("sort", e.target.value)}
      >
        <option value="recent">Plus récentes</option>
        <option value="price-asc">Prix croissant</option>
        <option value="price-desc">Prix décroissant</option>
      </select>
    </div>
  );
}
