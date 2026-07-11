"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import ListingCard from "@/components/listing/ListingCard";
import type { ListingCard as ListingCardType } from "@/lib/types";

export default function CategoryRow({
  title,
  listings,
  seeAllHref,
  nights,
}: {
  title: string;
  listings: ListingCardType[];
  seeAllHref: string;
  nights: number;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (listings.length === 0) return null;

  const scroll = (dir: 1 | -1) => scrollerRef.current?.scrollBy({ left: dir * 600, behavior: "smooth" });

  return (
    <section className="py-6">
      <div className="mb-4 flex items-center justify-between">
        <Link href={seeAllHref} className="group flex items-center gap-2">
          <h2 className="text-xl font-semibold sm:text-2xl">{title}</h2>
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card transition group-hover:bg-black/5 dark:group-hover:bg-white/10">
            <ArrowRight size={14} />
          </span>
        </Link>
        <div className="hidden gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Scroll left"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card hover:bg-black/5 dark:hover:bg-white/10"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Scroll right"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card hover:bg-black/5 dark:hover:bg-white/10"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div ref={scrollerRef} className="no-scrollbar flex gap-5 overflow-x-auto scroll-smooth pb-1">
        {listings.map((listing) => (
          <div key={listing.id} className="w-[46vw] shrink-0 sm:w-[220px] md:w-[240px]">
            <ListingCard listing={listing} nights={nights} />
          </div>
        ))}
      </div>
    </section>
  );
}
