"use client";

import { Home, Building2, Warehouse, Castle, Trees, Waves, LandPlot, Sparkles } from "lucide-react";

const CATEGORIES: { label: string; icon: React.ElementType; propertyType?: string }[] = [
  { label: "All", icon: Sparkles },
  { label: "Houses", icon: Home, propertyType: "House" },
  { label: "Apartments", icon: Building2, propertyType: "Apartment" },
  { label: "Cabins", icon: Warehouse, propertyType: "Cabin" },
  { label: "Villas", icon: Castle, propertyType: "Villa" },
  { label: "Cottages", icon: Trees, propertyType: "Cottage" },
  { label: "Lofts", icon: LandPlot, propertyType: "Loft" },
  { label: "Guesthouses", icon: Waves, propertyType: "Guesthouse" },
];

export default function CategoryFilterBar({
  active,
  onChange,
}: {
  active?: string;
  onChange: (propertyType?: string) => void;
}) {
  return (
    <div className="no-scrollbar flex items-center gap-6 overflow-x-auto border-b border-border px-1 py-4">
      {CATEGORIES.map(({ label, icon: Icon, propertyType }) => {
        const isActive = propertyType === active || (!propertyType && !active);
        return (
          <button
            key={label}
            onClick={() => onChange(propertyType)}
            className={`flex shrink-0 flex-col items-center gap-2 border-b-2 pb-3 pt-1 text-xs transition ${
              isActive ? "border-foreground text-foreground font-semibold" : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.75} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
