import { Star } from "lucide-react";
import { format } from "date-fns";
import type { Review } from "@/lib/types";

export default function ReviewsList({
  reviews,
  avgRating,
  reviewCount,
}: {
  reviews: Review[];
  avgRating: number;
  reviewCount: number;
}) {
  return (
    <div className="border-b border-border py-8">
      <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold">
        <Star size={18} className="fill-foreground" />
        {reviewCount > 0 ? `${avgRating.toFixed(2)} · ${reviewCount} review${reviewCount === 1 ? "" : "s"}` : "No reviews yet"}
      </h2>

      {reviews.length === 0 ? (
        <p className="text-sm text-muted">Be the first to review this place after your stay.</p>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          {reviews.map((review) => (
            <div key={review.id}>
              <div className="mb-2 flex items-center gap-3">
                <img src={review.author.avatar_url} alt={review.author.name} className="h-10 w-10 rounded-full bg-muted" />
                <div>
                  <p className="text-sm font-semibold">{review.author.name}</p>
                  <p className="text-xs text-muted">{format(new Date(review.created_at), "MMMM yyyy")}</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
