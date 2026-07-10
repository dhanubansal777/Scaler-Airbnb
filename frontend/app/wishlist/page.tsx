"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useFavorites } from "@/lib/favorites-context";
import { DEFAULT_DISPLAY_NIGHTS } from "@/lib/currency";
import type { ListingCard as ListingCardType } from "@/lib/types";
import ListingGrid from "@/components/listing/ListingGrid";

export default function WishlistPage() {
  const { user, loading: authLoading, openAuthModal } = useAuth();
  const { favoriteIds } = useFavorites();
  const [listings, setListings] = useState<ListingCardType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api
      .get<ListingCardType[]>("/api/favorites/me")
      .then(setListings)
      .finally(() => setLoading(false));
  }, [user, favoriteIds]);

  if (!authLoading && !user) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">Log in to view your wishlist</h1>
        <p className="text-sm text-muted">Save your favorite stays and come back to them anytime.</p>
        <button onClick={() => openAuthModal("login")} className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark">
          Log in
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
      <h1 className="mb-8 text-3xl font-semibold">Wishlist</h1>
      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : listings.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-lg font-semibold">No favorites yet</p>
          <p className="text-sm text-muted">Tap the heart icon on any stay to save it here.</p>
          <Link href="/" className="rounded-lg border border-foreground px-6 py-3 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/10">
            Explore stays
          </Link>
        </div>
      ) : (
        <ListingGrid listings={listings} nights={DEFAULT_DISPLAY_NIGHTS} />
      )}
    </div>
  );
}
