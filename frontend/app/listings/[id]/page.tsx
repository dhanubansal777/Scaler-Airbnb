import ListingDetailClient from "@/components/listing/ListingDetailClient";

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ListingDetailClient id={Number(id)} />;
}
