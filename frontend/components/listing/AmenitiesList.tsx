import { AmenityIcon } from "@/lib/amenity-icons";
import type { Amenity } from "@/lib/types";

export default function AmenitiesList({ amenities }: { amenities: Amenity[] }) {
  if (amenities.length === 0) return null;
  return (
    <div className="border-b border-border py-8">
      <h2 className="mb-4 text-xl font-semibold">What this place offers</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {amenities.map((a) => (
          <div key={a.id} className="flex items-center gap-4 text-sm">
            <AmenityIcon icon={a.icon} />
            {a.name}
          </div>
        ))}
      </div>
    </div>
  );
}
