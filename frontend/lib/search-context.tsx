"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";

interface SearchContextValue {
  location: string;
  setLocation: (value: string) => void;
  range: DateRange | undefined;
  setRange: (value: DateRange | undefined) => void;
  guests: number;
  setGuests: (value: number) => void;
  reset: () => void;
}

const SearchContext = createContext<SearchContextValue | undefined>(undefined);

/**
 * Holds the navbar search selections (location/dates/guests) above the
 * SearchBar component itself. The navbar swaps between an expanded and a
 * compact SearchBar instance on scroll/route change — if this state lived
 * inside SearchBar, that swap would unmount/remount it and silently drop
 * whatever the user had picked. Lifting it here means the selection
 * survives that swap and only clears on an explicit "Clear all" or a page
 * reload.
 */
export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState("");
  const [range, setRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(1);

  const reset = () => {
    setLocation("");
    setRange(undefined);
    setGuests(1);
  };

  const value = useMemo(
    () => ({ location, setLocation, range, setRange, guests, setGuests, reset }),
    [location, range, guests]
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearchState() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearchState must be used within SearchProvider");
  return ctx;
}
