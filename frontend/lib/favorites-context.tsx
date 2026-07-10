"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { api } from "./api";
import { useAuth } from "./auth-context";
import type { ListingCard } from "./types";

interface FavoritesContextValue {
  favoriteIds: Set<number>;
  toggleFavorite: (listingId: number) => Promise<void>;
  isFavorited: (listingId: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user, openAuthModal } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }
    api
      .get<ListingCard[]>("/api/favorites/me")
      .then((items) => setFavoriteIds(new Set(items.map((i) => i.id))))
      .catch(() => setFavoriteIds(new Set()));
  }, [user]);

  const toggleFavorite = useCallback(
    async (listingId: number) => {
      if (!user) {
        openAuthModal("login");
        return;
      }
      const isFav = favoriteIds.has(listingId);
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (isFav) next.delete(listingId);
        else next.add(listingId);
        return next;
      });
      try {
        if (isFav) {
          await api.del(`/api/favorites/${listingId}`);
          toast("Removed from wishlist");
        } else {
          await api.post(`/api/favorites/${listingId}`);
          toast.success("Added to wishlist");
        }
      } catch {
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (isFav) next.add(listingId);
          else next.delete(listingId);
          return next;
        });
        toast.error("Could not update wishlist");
      }
    },
    [favoriteIds, user, openAuthModal]
  );

  const isFavorited = useCallback((listingId: number) => favoriteIds.has(listingId), [favoriteIds]);

  const value = useMemo(() => ({ favoriteIds, toggleFavorite, isFavorited }), [favoriteIds, toggleFavorite, isFavorited]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
