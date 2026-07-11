"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { differenceInCalendarDays } from "date-fns";
import { api } from "@/lib/api";
import { DEFAULT_DISPLAY_NIGHTS } from "@/lib/currency";
import type { PaginatedListings } from "@/lib/types";
import ListingGrid from "@/components/listing/ListingGrid";
import Pagination from "@/components/ui/Pagination";
import CategoryFilterBar from "@/components/ui/CategoryFilterBar";
import FilterDrawer, { type FilterState } from "@/components/ui/FilterDrawer";
import Footer from "@/components/home/Footer";
import CategoryRow from "@/components/home/CategoryRow";
import { REGION_CITIES, regionForCity, sortRegions } from "@/lib/regions";
import type { ListingCard as ListingCardType } from "@/lib/types";

const PriceMap = dynamic(() => import("@/components/listing/PriceMap"), { ssr: false });

export default function HomeClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<PaginatedListings | null>(null);
  const [loading, setLoading] = useState(true);
  const [rowsData, setRowsData] = useState<PaginatedListings | null>(null);

  const page = Number(searchParams.get("page") || "1");
  const propertyType = searchParams.get("property_type") || undefined;
  const location = searchParams.get("location") || undefined;
  const locationLabel = searchParams.get("label") || location;
  const checkin = searchParams.get("checkin") || undefined;
  const checkout = searchParams.get("checkout") || undefined;
  const guests = searchParams.get("guests") || undefined;
  const minPrice = searchParams.get("min_price") || "";
  const maxPrice = searchParams.get("max_price") || "";
  const amenities = searchParams.get("amenities") || "";

  const showMap = Boolean(location);

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

  const isDefaultView = !location && !propertyType && !minPrice && !maxPrice && !amenities && !checkin && !checkout && page === 1;

  useEffect(() => {
    if (!isDefaultView || rowsData) return;
    api
      .get<PaginatedListings>("/api/listings?page=1&page_size=50")
      .then(setRowsData)
      .catch(() => {});
  }, [isDefaultView, rowsData]);

  const regionGroups = useMemo(() => {
    if (!rowsData) return [];
    const groups = new Map<string, ListingCardType[]>();
    for (const item of rowsData.items) {
      const region = regionForCity(item.city);
      if (!groups.has(region)) groups.set(region, []);
      groups.get(region)!.push(item);
    }
    return sortRegions([...groups.keys()]).map((region) => ({
      region,
      listings: groups.get(region)!.slice(0, 10),
    }));
  }, [rowsData]);

  const filterState: FilterState = {
    minPrice,
    maxPrice,
    amenityIds: amenities ? amenities.split(",").map(Number) : [],
  };

  const nights = useMemo(() => {
    if (!checkin || !checkout) return DEFAULT_DISPLAY_NIGHTS;
    const n = differenceInCalendarDays(new Date(checkout), new Date(checkin));
    return n > 0 ? n : DEFAULT_DISPLAY_NIGHTS;
  }, [checkin, checkout]);

  const listResults = loading ? (
    <div
      className={`grid grid-cols-1 gap-x-6 gap-y-10 py-8 sm:grid-cols-2 ${
        showMap ? "md:grid-cols-3" : "md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      }`}
    >
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
      <ListingGrid listings={data?.items || []} nights={nights} compact={showMap} />
      <Pagination page={page} totalPages={data?.total_pages || 1} onChange={(p) => updateParams({ page: String(p) })} />
    </>
  );

  return (
    <>
      <div className={`mx-auto px-4 sm:px-6 lg:px-10 ${showMap ? "max-w-[1800px]" : "max-w-7xl"}`}>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6 border-b border-border py-4">
          <div aria-hidden="true" />
          <CategoryFilterBar active={propertyType} onChange={(pt) => updateParams({ property_type: pt })} />
          <div className="flex shrink-0 justify-end">
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
        </div>

        {isDefaultView && !rowsData ? (
          <div className="grid grid-cols-2 gap-5 py-8 sm:grid-cols-4 md:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square w-full rounded-2xl bg-muted/20" />
                <div className="mt-2 h-4 w-3/4 rounded bg-muted/20" />
                <div className="mt-2 h-4 w-1/2 rounded bg-muted/20" />
              </div>
            ))}
          </div>
        ) : isDefaultView ? (
          regionGroups.map(({ region, listings }) => (
            <CategoryRow
              key={region}
              title={`Popular homes in ${region}`}
              listings={listings}
              nights={nights}
              seeAllHref={`/?location=${encodeURIComponent((REGION_CITIES[region] ?? [region]).join(","))}&label=${encodeURIComponent(region)}`}
            />
          ))
        ) : (
          <>
            {location && (
              <p className="pb-4 text-sm text-muted">
                {data?.total ?? 0} stays {checkin && checkout ? "available" : "found"} in <b>{locationLabel}</b>
              </p>
            )}

            {showMap ? (
              <div className="flex gap-8">
                <div className="min-w-0 flex-1">{listResults}</div>
                <div className="sticky top-24 hidden h-[calc(100vh-7rem)] w-[42%] shrink-0 lg:block">
                  <PriceMap listings={data?.items || []} />
                </div>
              </div>
            ) : (
              listResults
            )}
          </>
        )}
      </div>
      <Footer />
    </>
  );
}
