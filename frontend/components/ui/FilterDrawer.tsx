"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import Modal from "./Modal";
import { api } from "@/lib/api";
import type { Amenity } from "@/lib/types";

export interface FilterState {
  minPrice: string;
  maxPrice: string;
  amenityIds: number[];
}

export default function FilterDrawer({
  filters,
  onApply,
}: {
  filters: FilterState;
  onApply: (filters: FilterState) => void;
}) {
  const [open, setOpen] = useState(false);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [draft, setDraft] = useState<FilterState>(filters);

  useEffect(() => {
    api.get<Amenity[]>("/api/amenities").then(setAmenities).catch(() => setAmenities([]));
  }, []);

  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  const activeCount =
    (filters.minPrice ? 1 : 0) + (filters.maxPrice ? 1 : 0) + (filters.amenityIds.length > 0 ? 1 : 0);

  const toggleAmenity = (id: number) => {
    setDraft((d) => ({
      ...d,
      amenityIds: d.amenityIds.includes(id) ? d.amenityIds.filter((a) => a !== id) : [...d.amenityIds, id],
    }));
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-semibold hover:shadow-md"
      >
        <SlidersHorizontal size={14} />
        Filters
        {activeCount > 0 && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[10px] text-background">
            {activeCount}
          </span>
        )}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Filters" maxWidthClass="max-w-lg">
        <div className="space-y-8">
          <div>
            <h3 className="mb-3 text-sm font-semibold">Price range per night</h3>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-xs text-muted">Min</label>
                <input
                  type="number"
                  min={0}
                  value={draft.minPrice}
                  onChange={(e) => setDraft((d) => ({ ...d, minPrice: e.target.value }))}
                  placeholder="₹0"
                  className="w-full rounded-lg border border-border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-foreground"
                />
              </div>
              <span className="mt-4 text-muted">—</span>
              <div className="flex-1">
                <label className="mb-1 block text-xs text-muted">Max</label>
                <input
                  type="number"
                  min={0}
                  value={draft.maxPrice}
                  onChange={(e) => setDraft((d) => ({ ...d, maxPrice: e.target.value }))}
                  placeholder="₹25,000+"
                  className="w-full rounded-lg border border-border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-foreground"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Amenities</h3>
            <div className="grid grid-cols-2 gap-3">
              {amenities.map((a) => (
                <label key={a.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={draft.amenityIds.includes(a.id)}
                    onChange={() => toggleAmenity(a.id)}
                    className="h-4 w-4 accent-foreground"
                  />
                  {a.name}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
          <button
            onClick={() => setDraft({ minPrice: "", maxPrice: "", amenityIds: [] })}
            className="text-sm font-semibold underline"
          >
            Clear all
          </button>
          <button
            onClick={() => {
              onApply(draft);
              setOpen(false);
            }}
            className="rounded-lg bg-foreground px-5 py-3 text-sm font-semibold text-background hover:opacity-90"
          >
            Show results
          </button>
        </div>
      </Modal>
    </>
  );
}
