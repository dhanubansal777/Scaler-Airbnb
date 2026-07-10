"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Plus } from "lucide-react";
import { api } from "@/lib/api";
import type { HostListing } from "@/lib/types";

export default function HostListingsTab() {
  const [listings, setListings] = useState<HostListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<HostListing[]>("/api/host/listings")
      .then(setListings)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-muted">Loading your listings…</p>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted">{listings.length} listing{listings.length === 1 ? "" : "s"}</p>
        <Link
          href="/host/listings/new"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          <Plus size={16} /> Create listing
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-lg font-semibold">You have no listings yet</p>
          <p className="text-sm text-muted">Create your first listing to start hosting guests.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <Link
              key={listing.id}
              href={`/host/listings/${listing.id}/edit`}
              className="overflow-hidden rounded-2xl border border-border hover:shadow-lg"
            >
              <div className="aspect-video w-full bg-muted/20">
                {listing.cover_photo && <img src={listing.cover_photo} alt={listing.title} className="h-full w-full object-cover" />}
              </div>
              <div className="space-y-1 p-4">
                <p className="truncate text-sm font-semibold">{listing.title}</p>
                <p className="text-xs text-muted">
                  {listing.city}, {listing.state}
                </p>
                <div className="flex items-center justify-between pt-1 text-xs text-muted">
                  <span>${listing.price_per_night.toFixed(0)} / night</span>
                  <span className="flex items-center gap-1">
                    <Star size={11} className="fill-foreground" />
                    {listing.avg_rating > 0 ? listing.avg_rating.toFixed(1) : "New"}
                  </span>
                </div>
                <p className="text-xs text-muted">{listing.booking_count} reservation{listing.booking_count === 1 ? "" : "s"}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
