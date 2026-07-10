"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { api } from "@/lib/api";
import type { HostBooking } from "@/lib/types";

export default function HostBookingsTab() {
  const [bookings, setBookings] = useState<HostBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<HostBooking[]>("/api/host/bookings")
      .then(setBookings)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-muted">Loading reservations…</p>;

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-lg font-semibold">No reservations yet</p>
        <p className="text-sm text-muted">Bookings for your listings will show up here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-border bg-black/5 text-xs uppercase text-muted dark:bg-white/5">
          <tr>
            <th className="px-4 py-3">Guest</th>
            <th className="px-4 py-3">Listing</th>
            <th className="px-4 py-3">Dates</th>
            <th className="px-4 py-3">Guests</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id} className="border-b border-border last:border-0">
              <td className="flex items-center gap-2 px-4 py-3">
                <img src={b.guest.avatar_url} alt={b.guest.name} className="h-7 w-7 rounded-full bg-muted" />
                {b.guest.name}
              </td>
              <td className="px-4 py-3">{b.listing?.title}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                {format(new Date(b.check_in), "MMM d")} – {format(new Date(b.check_out), "MMM d, yyyy")}
              </td>
              <td className="px-4 py-3">{b.guests_count}</td>
              <td className="px-4 py-3">${b.total_price.toFixed(2)}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    b.status === "confirmed" ? "bg-green-500/15 text-green-600" : "bg-muted/20 text-muted"
                  }`}
                >
                  {b.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
