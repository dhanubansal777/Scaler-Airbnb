"use client";

import Link from "next/link";
import { Heart, Star } from "lucide-react";
import { useFavorites } from "@/lib/favorites-context";
import { formatINR } from "@/lib/currency";
import type { ListingCard as ListingCardType } from "@/lib/types";

export default function ListingCard({ listing, nights = 0 }: { listing: ListingCardType; nights?: number }) {
  const { isFavorited, toggleFavorite } = useFavorites();
  const favorited = isFavorited(listing.id);
  const hasRating = listing.avg_rating > 0;

  return (
    <Link href={`/listings/${listing.id}`} className="group block">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted/20">
        {listing.cover_photo ? (
          <img
            src={listing.cover_photo}
            alt={listing.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted">No photo</div>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(listing.id);
          }}
          aria-label="Toggle wishlist"
          className="absolute right-3 top-3 transition hover:scale-110"
        >
          <Heart
            size={24}
            className={favorited ? "fill-primary text-primary" : "fill-black/30 text-white"}
            strokeWidth={1.5}
          />
        </button>
      </div>

      <div className="mt-2 space-y-0.5">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-semibold">
            {listing.property_type} in {listing.city}
          </p>
          {hasRating && nights === 0 && (
            <span className="flex shrink-0 items-center gap-1 text-sm">
              <Star size={12} className="fill-foreground" />
              {listing.avg_rating.toFixed(1)}
            </span>
          )}
        </div>
        <p className="pt-1 text-sm">
          {nights > 0 ? (
            <>
              <span className="font-semibold">{formatINR(listing.price_per_night * nights)}</span> for {nights} night
              {nights > 1 ? "s" : ""}
            </>
          ) : (
            <>
              <span className="font-semibold">{formatINR(listing.price_per_night)}</span> night
            </>
          )}
          {hasRating && nights > 0 && (
            <span className="ml-1 inline-flex items-center gap-1">
              · <Star size={11} className="fill-foreground" /> {listing.avg_rating.toFixed(1)}
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}
