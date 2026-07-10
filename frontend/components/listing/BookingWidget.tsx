"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import { differenceInCalendarDays, format } from "date-fns";
import { Star, Minus, Plus } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import { formatINR } from "@/lib/currency";
import type { Booking, ListingDetail } from "@/lib/types";

const SERVICE_FEE_RATE = 0.12;

export default function BookingWidget({ listing }: { listing: ListingDetail }) {
  const { user, openAuthModal } = useAuth();
  const router = useRouter();
  const [range, setRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(1);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disabledRanges = useMemo(
    () => listing.booked_ranges.map((r) => ({ from: new Date(r.check_in), to: new Date(new Date(r.check_out).getTime() - 86400000) })),
    [listing.booked_ranges]
  );

  const nights = range?.from && range?.to ? differenceInCalendarDays(range.to, range.from) : 0;
  const subtotal = nights * listing.price_per_night;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE * 100) / 100;
  const total = Math.round((subtotal + listing.cleaning_fee + serviceFee) * 100) / 100;

  const handleReserveClick = () => {
    if (!range?.from || !range?.to) {
      toast.error("Select your check-in and check-out dates");
      return;
    }
    if (!user) {
      openAuthModal("login");
      return;
    }
    setError(null);
    setCheckoutOpen(true);
  };

  const confirmBooking = async () => {
    if (!range?.from || !range?.to) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.post<Booking>("/api/bookings", {
        listing_id: listing.id,
        check_in: format(range.from, "yyyy-MM-dd"),
        check_out: format(range.to, "yyyy-MM-dd"),
        guests_count: guests,
      });
      toast.success("Booking confirmed! Check My Trips.");
      setCheckoutOpen(false);
      router.push("/trips");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not complete booking");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="sticky top-24 rounded-2xl border border-border p-6 shadow-lg">
        <div className="mb-4 flex items-baseline justify-between">
          <p className="text-lg">
            <span className="text-xl font-semibold">{formatINR(listing.price_per_night)}</span>{" "}
            <span className="text-sm text-muted">night</span>
          </p>
          {listing.review_count > 0 && (
            <span className="flex items-center gap-1 text-sm">
              <Star size={12} className="fill-foreground" />
              {listing.avg_rating.toFixed(1)} · {listing.review_count} reviews
            </span>
          )}
        </div>

        <div className="rounded-xl border border-border">
          <div className="grid grid-cols-2 divide-x divide-border border-b border-border">
            <div className="p-3">
              <label className="block text-[10px] font-semibold uppercase">Check-in</label>
              <span className="text-sm">{range?.from ? format(range.from, "MM/dd/yyyy") : "Add date"}</span>
            </div>
            <div className="p-3">
              <label className="block text-[10px] font-semibold uppercase">Check-out</label>
              <span className="text-sm">{range?.to ? format(range.to, "MM/dd/yyyy") : "Add date"}</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-3">
            <div>
              <label className="block text-[10px] font-semibold uppercase">Guests</label>
              <span className="text-sm">
                {guests} guest{guests > 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setGuests((g) => Math.max(1, g - 1))}
                disabled={guests <= 1}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-border disabled:opacity-30"
              >
                <Minus size={12} />
              </button>
              <button
                onClick={() => setGuests((g) => Math.min(listing.max_guests, g + 1))}
                disabled={guests >= listing.max_guests}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-border disabled:opacity-30"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 w-full max-w-full box-border overflow-visible px-1">
          <DayPicker
            mode="range"
            numberOfMonths={1}
            selected={range}
            onSelect={setRange}
            disabled={[{ before: new Date() }, ...disabledRanges]}
            className="w-full max-w-full text-sm"
          />
        </div>
        <p className="mb-2 text-center text-xs text-muted">Sleeps up to {listing.max_guests} guests</p>

        <button
          onClick={handleReserveClick}
          className="w-full rounded-lg bg-primary py-3.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          Reserve
        </button>

        {nights > 0 && (
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="underline">
                {formatINR(listing.price_per_night)} x {nights} night{nights > 1 ? "s" : ""}
              </span>
              <span>{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="underline">Cleaning fee</span>
              <span>{formatINR(listing.cleaning_fee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="underline">Service fee</span>
              <span>{formatINR(serviceFee)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-3 font-semibold">
              <span>Total</span>
              <span>{formatINR(total)}</span>
            </div>
          </div>
        )}
      </div>

      <Modal open={checkoutOpen} onClose={() => !submitting && setCheckoutOpen(false)} title="Confirm and pay" maxWidthClass="max-w-lg">
        <div className="space-y-6">
          <div className="flex gap-4 border-b border-border pb-6">
            {listing.photos[0] && (
              <img src={listing.photos[0].url} alt={listing.title} className="h-20 w-20 rounded-lg object-cover" />
            )}
            <div>
              <p className="text-sm font-semibold">{listing.title}</p>
              <p className="text-xs text-muted">
                {listing.city}, {listing.state}
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold">Trip details</h3>
            <p className="text-sm text-muted">
              {range?.from && format(range.from, "MMM d, yyyy")} – {range?.to && format(range.to, "MMM d, yyyy")}
            </p>
            <p className="text-sm text-muted">
              {guests} guest{guests > 1 ? "s" : ""}
            </p>
          </div>

          <div className="space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <span>
                {formatINR(listing.price_per_night)} x {nights} nights
              </span>
              <span>{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Cleaning fee</span>
              <span>{formatINR(listing.cleaning_fee)}</span>
            </div>
            <div className="flex justify-between">
              <span>Service fee</span>
              <span>{formatINR(serviceFee)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
              <span>Total (INR)</span>
              <span>{formatINR(total)}</span>
            </div>
          </div>

          <div className="rounded-lg bg-black/5 p-3 text-xs text-muted dark:bg-white/10">
            This is a mocked checkout for demo purposes — no real payment is processed.
          </div>

          {error && <p className="text-sm text-primary">{error}</p>}

          <button
            onClick={confirmBooking}
            disabled={submitting}
            className="w-full rounded-lg bg-primary py-3.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {submitting ? "Confirming…" : "Confirm and pay"}
          </button>
        </div>
      </Modal>
    </>
  );
}
