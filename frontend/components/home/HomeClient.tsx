"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import type { PaginatedListings } from "@/lib/types";
import ListingGrid from "@/components/listing/ListingGrid";
import Pagination from "@/components/ui/Pagination";
import CategoryFilterBar from "@/components/ui/CategoryFilterBar";
import FilterDrawer, { type FilterState } from "@/components/ui/FilterDrawer";

export default function HomeClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<PaginatedListings | null>(null);
  const [loading, setLoading] = useState(true);

  const page = Number(searchParams.get("page") || "1");
  const propertyType = searchParams.get("property_type") || undefined;
  const location = searchParams.get("location") || undefined;
  const checkin = searchParams.get("checkin") || undefined;
  const checkout = searchParams.get("checkout") || undefined;
  const guests = searchParams.get("guests") || undefined;
  const minPrice = searchParams.get("min_price") || "";
  const maxPrice = searchParams.get("max_price") || "";
  const amenities = searchParams.get("amenities") || "";

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      if (!("page" in updates)) params.delete("page");
      router.push(`/?${params.toString()}`);
    },
    [router, searchParams]
  );

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("page_size", "20");
    if (propertyType) params.set("property_type", propertyType);
    if (location) params.set("location", location);
    if (checkin) params.set("checkin", checkin);
    if (checkout) params.set("checkout", checkout);
    if (guests) params.set("guests", guests);
    if (minPrice) params.set("min_price", minPrice);
    if (maxPrice) params.set("max_price", maxPrice);
    if (amenities) params.set("amenities", amenities);

    api
      .get<PaginatedListings>(`/api/listings?${params.toString()}`)
      .then(setData)
      .catch(() => setData({ items: [], total: 0, page: 1, page_size: 20, total_pages: 1 }))
      .finally(() => setLoading(false));
  }, [page, propertyType, location, checkin, checkout, guests, minPrice, maxPrice, amenities]);

  const filterState: FilterState = {
    minPrice,
    maxPrice,
    amenityIds: amenities ? amenities.split(",").map(Number) : [],
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <CategoryFilterBar active={propertyType} onChange={(pt) => updateParams({ property_type: pt })} />
      </div>
      <div className="flex justify-end py-4">
        <FilterDrawer
          filters={filterState}
          onApply={(f) =>
            updateParams({
              min_price: f.minPrice || undefined,
              max_price: f.maxPrice || undefined,
              amenities: f.amenityIds.length ? f.amenityIds.join(",") : undefined,
            })
          }
        />
      </div>

      {location && (
        <p className="pb-4 text-sm text-muted">
          {data?.total ?? 0} stays {checkin && checkout ? "available" : "found"} in <b>{location}</b>
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 py-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square w-full rounded-2xl bg-muted/20" />
              <div className="mt-2 h-4 w-3/4 rounded bg-muted/20" />
              <div className="mt-2 h-4 w-1/2 rounded bg-muted/20" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <ListingGrid listings={data?.items || []} />
          <Pagination page={page} totalPages={data?.total_pages || 1} onChange={(p) => updateParams({ page: String(p) })} />
        </>
      )}
      <div className="h-16" />
    </div>
  );
}
