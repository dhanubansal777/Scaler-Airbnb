import EditListingClient from "@/components/host/EditListingClient";

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditListingClient id={Number(id)} />;
}
