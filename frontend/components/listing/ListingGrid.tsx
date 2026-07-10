import ListingCard from "./ListingCard";
import type { ListingCard as ListingCardType } from "@/lib/types";

export default function ListingGrid({ listings, nights = 0 }: { listings: ListingCardType[]; nights?: number }) {
  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-24 text-center">
        <p className="text-lg font-semibold">No stays found</p>
        <p className="text-sm text-muted">Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} nights={nights} />
      ))}
    </div>
  );
}
