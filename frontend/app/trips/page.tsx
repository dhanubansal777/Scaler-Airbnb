"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { format, isPast } from "date-fns";
import toast from "react-hot-toast";
import { MapPin } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { formatINR } from "@/lib/currency";
import type { Booking } from "@/lib/types";
import ReviewModal from "@/components/trips/ReviewModal";

export default function TripsPage() {
  const { user, loading: authLoading, openAuthModal } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewTarget, setReviewTarget] = useState<Booking | null>(null);

  const load = useCallback(() => {
    if (!user) return;
    setLoading(true);
    api
      .get<Booking[]>("/api/bookings/me")
      .then(setBookings)
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  if (!authLoading && !user) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">Log in to see your trips</h1>
        <p className="text-sm text-muted">Track upcoming stays, past trips, and leave reviews once you sign in.</p>
        <button onClick={() => openAuthModal("login")} className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark">
          Log in
        </button>
      </div>
    );
  }

  const cancelBooking = async (booking: Booking) => {
    if (!confirm("Cancel this reservation?")) return;
    try {
      await api.del(`/api/bookings/${booking.id}`);
      toast.success("Reservation cancelled");
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not cancel");
    }
  };

  const upcoming = bookings.filter((b) => b.status === "confirmed" && !isPast(new Date(b.check_out)));
  const past = bookings.filter((b) => b.status === "confirmed" && isPast(new Date(b.check_out)));
  const cancelled = bookings.filter((b) => b.status === "cancelled");

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-10">
      <h1 className="mb-8 text-3xl font-semibold">My Trips</h1>

      {loading ? (
        <p className="text-sm text-muted">Loading your trips…</p>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-lg font-semibold">No trips booked yet</p>
          <p className="text-sm text-muted">Time to dust off your bags and start planning your next adventure.</p>
          <Link href="/" className="rounded-lg border border-foreground px-6 py-3 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/10">
            Start searching
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          {upcoming.length > 0 && (
            <Section title="Upcoming">
              {upcoming.map((b) => (
                <BookingCard key={b.id} booking={b} onCancel={() => cancelBooking(b)} />
              ))}
            </Section>
          )}
          {past.length > 0 && (
            <Section title="Past trips">
              {past.map((b) => (
                <BookingCard key={b.id} booking={b} onReview={() => setReviewTarget(b)} />
              ))}
            </Section>
          )}
          {cancelled.length > 0 && (
            <Section title="Cancelled">
              {cancelled.map((b) => (
                <BookingCard key={b.id} booking={b} cancelledView />
              ))}
            </Section>
          )}
        </div>
      )}

      {reviewTarget && (
        <ReviewModal
          booking={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSubmitted={() => {
            setReviewTarget(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function BookingCard({
  booking,
  onCancel,
  onReview,
  cancelledView,
}: {
  booking: Booking;
  onCancel?: () => void;
  onReview?: () => void;
  cancelledView?: boolean;
}) {
  return (
    <div className={`flex gap-4 rounded-2xl border border-border p-4 ${cancelledView ? "opacity-60" : ""}`}>
      <Link href={`/listings/${booking.listing_id}`} className="shrink-0">
        {booking.listing?.cover_photo ? (
          <img src={booking.listing.cover_photo} alt={booking.listing.title} className="h-24 w-24 rounded-xl object-cover" />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-muted/20 text-muted">
            <MapPin size={20} />
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link href={`/listings/${booking.listing_id}`} className="text-sm font-semibold hover:underline">
            {booking.listing?.title || "Listing"}
          </Link>
          <p className="text-xs text-muted">
            {booking.listing?.city}, {booking.listing?.state}
          </p>
          <p className="mt-1 text-xs text-muted">
            {format(new Date(booking.check_in), "MMM d, yyyy")} – {format(new Date(booking.check_out), "MMM d, yyyy")} ·{" "}
            {booking.guests_count} guest{booking.guests_count > 1 ? "s" : ""}
          </p>
          <p className="text-xs font-semibold">{formatINR(booking.total_price)} total</p>
        </div>
        <div className="mt-2 flex gap-2">
          {onCancel && (
            <button onClick={onCancel} className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/10">
              Cancel
            </button>
          )}
          {onReview && !booking.has_review && (
            <button onClick={onReview} className="rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:opacity-90">
              Leave a review
            </button>
          )}
          {onReview && booking.has_review && <span className="px-1 py-1.5 text-xs text-muted">Reviewed ✓</span>}
          {cancelledView && <span className="px-1 py-1.5 text-xs text-muted">Cancelled</span>}
        </div>
      </div>
    </div>
  );
}
