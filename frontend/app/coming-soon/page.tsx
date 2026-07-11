import Link from "next/link";
import { Construction } from "lucide-react";

export default async function ComingSoonPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const { topic } = await searchParams;

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-24 text-center">
      <Construction size={40} className="text-muted" />
      <h1 className="text-2xl font-semibold">{topic || "This page"} is coming soon</h1>
      <p className="text-sm text-muted">
        This section isn&apos;t part of the demo yet, but the rest of the app — search, booking, and hosting — is fully
        functional.
      </p>
      <Link href="/" className="rounded-lg border border-foreground px-6 py-3 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/10">
        Back to home
      </Link>
    </div>
  );
}
