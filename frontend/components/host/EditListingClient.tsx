"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { ListingDetail } from "@/lib/types";
import ListingForm from "./ListingForm";

export default function EditListingClient({ id }: { id: number }) {
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<ListingDetail>(`/api/listings/${id}`)
      .then(setListing)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="px-6 py-16 text-center text-sm text-muted">Loading listing…</p>;
  if (!listing) return <p className="px-6 py-16 text-center text-sm text-muted">Listing not found.</p>;

  return <ListingForm mode="edit" listingId={id} initial={listing} />;
}
