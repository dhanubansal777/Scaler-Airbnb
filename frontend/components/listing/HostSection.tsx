import Link from "next/link";
import { ShieldCheck, Star } from "lucide-react";
import { FaAirbnb } from "react-icons/fa6";
import { APP_NAME } from "@/lib/constants";
import type { Host } from "@/lib/types";

export default function HostSection({
  host,
  avgRating,
  reviewCount,
}: {
  host: Host;
  avgRating: number;
  reviewCount: number;
}) {
  return (
    <div className="border-b border-border py-8">
      <h2 className="mb-4 text-xl font-semibold">Meet your host</h2>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border p-8 sm:flex-row sm:justify-center sm:gap-10">
          <div className="relative shrink-0">
            <img src={host.avatar_url} alt={host.name} className="h-28 w-28 rounded-full bg-muted object-cover" />
            <span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white ring-4 ring-card">
              <ShieldCheck size={16} />
            </span>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-2xl font-bold">{host.name}</p>
            <p className="text-sm text-muted">Host</p>
            <div className="mt-4 flex gap-8 border-t border-border pt-4 text-center sm:text-left">
              <div>
                <p className="text-lg font-bold">{reviewCount}</p>
                <p className="text-xs text-muted">Reviews</p>
              </div>
              <div>
                <p className="flex items-center gap-1 text-lg font-bold">
                  {reviewCount > 0 ? avgRating.toFixed(1) : "New"}
                  <Star size={14} className="fill-foreground" />
                </p>
                <p className="text-xs text-muted">Rating</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-semibold">Host details</h3>
          <p className="text-sm leading-relaxed text-foreground/90">
            Response rate: 100%
            <br />
            Responds within an hour
          </p>
          <Link
            href="/coming-soon?topic=Messaging"
            className="mt-6 inline-block rounded-lg bg-black/5 px-6 py-3 text-sm font-semibold hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15"
          >
            Message host
          </Link>

          <div className="mt-8 flex items-start gap-3 border-t border-border pt-6">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FaAirbnb size={18} />
            </span>
            <p className="text-sm text-muted">
              To help protect your payment, always use {APP_NAME} to send money and communicate with hosts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
