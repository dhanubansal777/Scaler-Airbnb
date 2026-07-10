"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/auth-context";
import HostListingsTab from "@/components/host/HostListingsTab";
import HostBookingsTab from "@/components/host/HostBookingsTab";

export default function HostDashboardPage() {
  const { user, loading, openAuthModal, becomeHost } = useAuth();
  const [tab, setTab] = useState<"listings" | "bookings">("listings");
  const [switching, setSwitching] = useState(false);

  if (!loading && !user) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">Log in to access hosting</h1>
        <p className="text-sm text-muted">Sign in to create listings and manage reservations.</p>
        <button onClick={() => openAuthModal("login")} className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark">
          Log in
        </button>
      </div>
    );
  }

  if (!loading && user && !user.is_host) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">Become a host</h1>
        <p className="text-sm text-muted">
          Turn your extra space into extra income. Switching to hosting lets you create listings and manage bookings from guests.
        </p>
        <button
          disabled={switching}
          onClick={async () => {
            setSwitching(true);
            try {
              await becomeHost();
              toast.success("You're now a host!");
            } catch {
              toast.error("Could not switch to hosting");
            } finally {
              setSwitching(false);
            }
          }}
          className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
        >
          {switching ? "Switching…" : "Get started"}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10">
      <h1 className="mb-6 text-3xl font-semibold">Host dashboard</h1>
      <div className="mb-8 flex gap-6 border-b border-border">
        <button
          onClick={() => setTab("listings")}
          className={`border-b-2 pb-3 text-sm font-semibold ${tab === "listings" ? "border-foreground" : "border-transparent text-muted"}`}
        >
          Your listings
        </button>
        <button
          onClick={() => setTab("bookings")}
          className={`border-b-2 pb-3 text-sm font-semibold ${tab === "bookings" ? "border-foreground" : "border-transparent text-muted"}`}
        >
          Reservations
        </button>
      </div>
      {tab === "listings" ? <HostListingsTab /> : <HostBookingsTab />}
    </div>
  );
}
