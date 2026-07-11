"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { Search, Minus, Plus, MapPin } from "lucide-react";
import { format } from "date-fns";
import { useSearchState } from "@/lib/search-context";

const POPULAR_CITIES = ["Mumbai", "New Delhi", "Bengaluru", "Goa", "Jaipur", "Udaipur", "Gurugram", "Dehradun"];

type Field = "location" | "dates" | "guests" | null;

export default function SearchBar({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const { location, setLocation, range, setRange, guests, setGuests, reset } = useSearchState();
  const [activeField, setActiveField] = useState<Field>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveField(null);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (range?.from) params.set("checkin", format(range.from, "yyyy-MM-dd"));
    if (range?.to) params.set("checkout", format(range.to, "yyyy-MM-dd"));
    if (guests > 1) params.set("guests", String(guests));
    setActiveField(null);
    router.push(`/?${params.toString()}`);
  };

  const dateLabel = () => {
    if (range?.from && range?.to) return `${format(range.from, "MMM d")} – ${format(range.to, "MMM d")}`;
    if (range?.from) return format(range.from, "MMM d");
    return "Any week";
  };

  const toggleField = (field: Exclude<Field, null>) => setActiveField(activeField === field ? null : field);

  return (
    <div ref={containerRef} className={`relative ${compact ? "w-auto" : "w-full max-w-2xl"}`}>
      {compact ? (
        <div className="flex items-center gap-0 rounded-full border border-border bg-card py-2 pl-4 pr-1.5 shadow-sm transition hover:shadow-md">
          <span className="shrink-0 text-lg leading-none" role="img" aria-label="House">
            🏡
          </span>
          <button onClick={() => toggleField("location")} className="whitespace-nowrap pl-0.5 pr-2 text-sm font-semibold hover:opacity-70">
            {location || "Anywhere"}
          </button>
          <span className="hidden h-4 w-px bg-border sm:block" />
          <button
            onClick={() => toggleField("dates")}
            className="hidden whitespace-nowrap px-2 text-sm font-semibold hover:opacity-70 sm:block"
          >
            {range?.from ? dateLabel() : "Anytime"}
          </button>
          <span className="hidden h-4 w-px bg-border md:block" />
          <button
            onClick={() => toggleField("guests")}
            className="hidden whitespace-nowrap px-2 text-sm text-muted hover:opacity-70 md:block"
          >
            {guests > 1 ? `${guests} guests` : "Add guests"}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSearch();
            }}
            className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white hover:bg-primary-dark"
            aria-label="Search"
          >
            <Search size={14} />
          </button>
        </div>
      ) : (
        <div className="flex items-center rounded-full border border-border bg-card shadow-sm transition hover:shadow-md">
          <button
            onClick={() => toggleField("location")}
            className={`flex-1 min-w-0 rounded-full px-3 py-2.5 text-left transition sm:px-6 sm:py-3 ${
              activeField === "location" ? "bg-card shadow-md" : ""
            }`}
          >
            <div className="text-xs font-semibold">Where</div>
            <div className="truncate text-sm text-muted">{location || "Search destinations"}</div>
          </button>
          <div className="h-8 w-px shrink-0 bg-border" />
          <button
            onClick={() => toggleField("dates")}
            className={`flex-1 min-w-0 rounded-full px-3 py-2.5 text-left transition sm:px-6 sm:py-3 ${
              activeField === "dates" ? "bg-card shadow-md" : ""
            }`}
          >
            <div className="text-xs font-semibold">When</div>
            <div className="truncate text-sm text-muted">{dateLabel()}</div>
          </button>
          <div className="hidden h-8 w-px shrink-0 bg-border sm:block" />
          <button
            onClick={() => toggleField("guests")}
            className={`hidden min-w-0 flex-1 rounded-full px-6 py-3 text-left transition sm:block ${
              activeField === "guests" ? "bg-card shadow-md" : ""
            }`}
          >
            <div className="text-xs font-semibold">Who</div>
            <div className="truncate text-sm text-muted">{guests > 1 ? `${guests} guests` : "Add guests"}</div>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSearch();
            }}
            className="mr-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white hover:bg-primary-dark sm:mr-2 sm:h-10 sm:w-10"
            aria-label="Search"
          >
            <Search size={16} />
          </button>
        </div>
      )}

      {activeField && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-40 rounded-3xl border border-border bg-card p-4 shadow-2xl sm:left-1/2 sm:right-auto sm:w-[420px] sm:-translate-x-1/2">
          {activeField === "location" && (
            <div>
              <div className="relative mb-3">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  autoFocus
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Search destinations"
                  className="w-full rounded-xl border border-border bg-transparent py-3 pl-9 pr-3 text-sm outline-none focus:border-foreground"
                />
              </div>
              <p className="mb-2 text-xs font-semibold text-muted">Popular destinations</p>
              <div className="grid grid-cols-2 gap-2">
                {POPULAR_CITIES.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setLocation(city);
                      setActiveField("dates");
                    }}
                    className="rounded-lg px-3 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeField === "dates" && (
            <div className="w-full max-w-full box-border overflow-visible px-1">
              <DayPicker
                mode="range"
                numberOfMonths={1}
                selected={range}
                onSelect={setRange}
                disabled={{ before: new Date() }}
                className="w-full max-w-full text-sm"
              />
            </div>
          )}

          {activeField === "guests" && (
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm font-semibold">Guests</div>
                <div className="text-xs text-muted">Ages 13 or above</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border disabled:opacity-30"
                  disabled={guests <= 1}
                >
                  <Minus size={14} />
                </button>
                <span className="w-4 text-center text-sm">{guests}</span>
                <button
                  onClick={() => setGuests(Math.min(16, guests + 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <button onClick={reset} className="text-sm font-semibold underline">
              Clear all
            </button>
            <button
              onClick={handleSearch}
              className="flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              <Search size={14} /> Search
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
