"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Star, Heart, Share, BedDouble, Bath, Users, ShieldCheck, PenLine } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useFavorites } from "@/lib/favorites-context";
import type { Booking, ListingDetail, Review } from "@/lib/types";
import PhotoGallery from "./PhotoGallery";
import AmenitiesList from "./AmenitiesList";
import HostSection from "./HostSection";
import ReviewsList from "./ReviewsList";
import BookingWidget from "./BookingWidget";
import Footer from "@/components/home/Footer";
import ReviewModal from "@/components/trips/ReviewModal";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

export default function ListingDetailClient({ id }: { id: number }) {
  const { user } = useAuth();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewableBooking, setReviewableBooking] = useState<Booking | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const { isFavorited, toggleFavorite } = useFavorites();

  const loadListing = useCallback(() => {
    return Promise.all([api.get<ListingDetail>(`/api/listings/${id}`), api.get<Review[]>(`/api/listings/${id}/reviews`)]).then(
      ([listingRes, reviewsRes]) => {
        setListing(listingRes);
        setReviews(reviewsRes);
      }
    );
  }, [id]);

  useEffect(() => {
    setLoading(true);
    loadListing().finally(() => setLoading(false));
  }, [loadListing]);

  useEffect(() => {
    if (!user) {
      setReviewableBooking(null);
      return;
    }
    const today = new Date();
    api
      .get<Booking[]>("/api/bookings/me")
      .then((bookings) => {
        const match = bookings.find(
          (b) => b.listing_id === id && b.status === "confirmed" && !b.has_review && new Date(b.check_out) <= today
        );
        setReviewableBooking(match || null);
      })
      .catch(() => setReviewableBooking(null));
  }, [user, id]);

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-16 text-center text-muted">Loading…</div>;
  }

  if (!listing) {
    return <div className="mx-auto max-w-6xl px-4 py-16 text-center text-muted">Listing not found.</div>;
  }

  const favorited = isFavorited(listing.id);

  return (
    <>
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

        {reviewableBooking && (
          <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-black/5 p-5 dark:bg-white/10 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <PenLine size={20} className="mt-0.5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold">You stayed here</p>
                <p className="text-sm text-muted">Share your experience to help other travelers.</p>
              </div>
            </div>
            <button
              onClick={() => setReviewModalOpen(true)}
              className="shrink-0 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Leave a review
            </button>
          </div>
        )}

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
              <Highlight
                icon={<BedDouble size={22} />}
                title={`${listing.bedrooms} bedroom${listing.bedrooms === 1 ? "" : "s"}`}
                subtitle={`${listing.beds} beds`}
              />
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

            <HostSection host={listing.host} avgRating={listing.avg_rating} reviewCount={listing.review_count} />

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
      <Footer />

      {reviewModalOpen && reviewableBooking && (
        <ReviewModal
          booking={reviewableBooking}
          onClose={() => setReviewModalOpen(false)}
          onSubmitted={() => {
            setReviewModalOpen(false);
            setReviewableBooking(null);
            loadListing();
          }}
        />
      )}
    </>
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
