"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import { api, ApiError } from "@/lib/api";
import type { Booking, Review } from "@/lib/types";

export default function ReviewModal({
  booking,
  onClose,
  onSubmitted,
}: {
  booking: Booking;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await api.post<Review>(`/api/listings/${booking.listing_id}/reviews`, {
        booking_id: booking.id,
        rating,
        comment,
      });
      toast.success("Review posted — thanks for sharing!");
      onSubmitted();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={`Review ${booking.listing?.title || "your stay"}`}>
      <div className="space-y-5">
        <div>
          <p className="mb-2 text-sm font-semibold">Overall rating</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}>
                <Star size={28} className={n <= rating ? "fill-primary text-primary" : "text-muted"} />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Your review</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Share details of your own experience at this place"
            className="w-full rounded-lg border border-border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-foreground"
          />
        </div>
        {error && <p className="text-sm text-primary">{error}</p>}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit review"}
        </button>
      </div>
    </Modal>
  );
}
