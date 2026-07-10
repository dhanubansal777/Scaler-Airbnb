"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Star, Heart, Share, BedDouble, Bath, Users, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { useFavorites } from "@/lib/favorites-context";
import type { ListingDetail, Review } from "@/lib/types";
import PhotoGallery from "./PhotoGallery";
import AmenitiesList from "./AmenitiesList";
import ReviewsList from "./ReviewsList";
import BookingWidget from "./BookingWidget";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

export default function ListingDetailClient({ id }: { id: number }) {
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { isFavorited, toggleFavorite } = useFavorites();

  useEffect(() => {
    setLoading(true);
    Promise.all([api.get<ListingDetail>(`/api/listings/${id}`), api.get<Review[]>(`/api/listings/${id}/reviews`)])
      .then(([listingRes, reviewsRes]) => {
        setListing(listingRes);
        setReviews(reviewsRes);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-16 text-center text-muted">Loading…</div>;
  }

  if (!listing) {
    return <div className="mx-auto max-w-6xl px-4 py-16 text-center text-muted">Listing not found.</div>;
  }

  const favorited = isFavorited(listing.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-10">
      <h1 className="text-2xl font-semibold sm:text-3xl">{listing.title}</h1>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-sm">
          {listing.review_count > 0 && (
            <span className="flex items-center gap-1 font-medium">
              <Star size={14} className="fill-foreground" />
              {listing.avg_rating.toFixed(2)} · {listing.review_count} reviews
            </span>
          )}
          <span className="underline">
            {listing.city}, {listing.state}, {listing.country}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm font-semibold">
          <button className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 hover:bg-black/5 dark:hover:bg-white/10">
            <Share size={16} /> Share
          </button>
          <button
            onClick={() => toggleFavorite(listing.id)}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 hover:bg-black/5 dark:hover:bg-white/10"
          >
            <Heart size={16} className={favorited ? "fill-primary text-primary" : ""} /> Save
          </button>
        </div>
      </div>

      <div className="mt-4">
        <PhotoGallery photos={listing.photos} title={listing.title} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <div className="flex items-start justify-between border-b border-border pb-8">
            <div>
              <h2 className="text-xl font-semibold">
                {listing.room_type} hosted by {listing.host.name}
              </h2>
              <p className="mt-1 flex flex-wrap gap-x-2 text-sm text-muted">
                <span>{listing.max_guests} guests</span>·<span>{listing.bedrooms} bedrooms</span>·
                <span>{listing.beds} beds</span>·<span>{listing.bathrooms} baths</span>
              </p>
            </div>
            <img src={listing.host.avatar_url} alt={listing.host.name} className="h-14 w-14 rounded-full bg-muted" />
          </div>

          <div className="grid grid-cols-1 gap-6 border-b border-border py-8 sm:grid-cols-3">
            <Highlight icon={<Users size={22} />} title={`${listing.property_type}`} subtitle="Entire place to yourself" />
            <Highlight icon={<BedDouble size={22} />} title={`${listing.bedrooms} bedroom${listing.bedrooms === 1 ? "" : "s"}`} subtitle={`${listing.beds} beds`} />
            <Highlight icon={<Bath size={22} />} title={`${listing.bathrooms} bath${listing.bathrooms === 1 ? "" : "s"}`} subtitle="Private" />
          </div>

          {listing.host.is_superhost && (
            <div className="flex items-center gap-3 border-b border-border py-6">
              <ShieldCheck size={22} className="text-primary" />
              <div>
                <p className="text-sm font-semibold">{listing.host.name} is a Superhost</p>
                <p className="text-xs text-muted">Superhosts are experienced, highly rated hosts.</p>
              </div>
            </div>
          )}

          <div className="border-b border-border py-8">
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">{listing.description}</p>
          </div>

          <AmenitiesList amenities={listing.amenities} />

          <div className="border-b border-border py-8">
            <h2 className="mb-4 text-xl font-semibold">Where you&apos;ll be</h2>
            <MapView lat={listing.latitude} lng={listing.longitude} />
            <p className="mt-3 text-sm text-muted">
              {listing.city}, {listing.state}, {listing.country}
            </p>
          </div>

          <ReviewsList reviews={reviews} avgRating={listing.avg_rating} reviewCount={listing.review_count} />
        </div>

        <div className="min-w-0">
          <BookingWidget listing={listing} />
        </div>
      </div>
    </div>
  );
}

function Highlight({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1">{icon}</div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted">{subtitle}</p>
      </div>
    </div>
  );
}
