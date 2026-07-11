"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { MapContainer, TileLayer, Marker, Polygon, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { formatINR } from "@/lib/currency";
import type { ListingCard } from "@/lib/types";

function pinIcon(price: number, highlighted: boolean) {
  return L.divIcon({
    className: "",
    html: `<div style="
      background:${highlighted ? "#222222" : "#ffffff"};
      color:${highlighted ? "#ffffff" : "#222222"};
      border-radius:999px;
      padding:6px 10px;
      font-weight:600;
      font-size:12px;
      font-family:inherit;
      white-space:nowrap;
      box-shadow:0 1px 4px rgba(0,0,0,0.35);
      border:1px solid rgba(0,0,0,0.08);
    ">${formatINR(price)}</div>`,
    iconSize: undefined,
    iconAnchor: [30, 16],
  });
}

/**
 * Approximates the dashed "neighborhood boundary" outline Airbnb draws
 * around the searched area. We don't have real administrative boundary
 * data, so this traces a deterministic, organic (non-circular) closed loop
 * around the listings' centroid — seeded by the coordinates themselves so
 * it's stable across reloads instead of jittering randomly each render.
 */
function generateBoundaryPath(center: [number, number], baseRadiusKm: number, pointCount = 16): [number, number][] {
  const [lat, lng] = center;
  const points: [number, number][] = [];
  for (let i = 0; i < pointCount; i++) {
    const angle = (i / pointCount) * Math.PI * 2;
    const jitter = 0.7 + 0.3 * Math.sin(angle * 3 + lat * 12) * Math.cos(angle * 2 + lng * 9);
    const radiusKm = baseRadiusKm * jitter;
    const dLat = (radiusKm / 111) * Math.sin(angle);
    const dLng = (radiusKm / (111 * Math.cos((lat * Math.PI) / 180))) * Math.cos(angle);
    points.push([lat + dLat, lng + dLng]);
  }
  return points;
}

function FitToListings({ listings }: { listings: ListingCard[] }) {
  const map = useMap();

  useEffect(() => {
    const points = listings.filter((l) => l.latitude && l.longitude).map((l): [number, number] => [l.latitude, l.longitude]);
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 13);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
  }, [listings, map]);

  return null;
}

export default function PriceMap({ listings }: { listings: ListingCard[] }) {
  const router = useRouter();
  const withCoords = listings.filter((l) => l.latitude && l.longitude);

  const center: [number, number] = useMemo(() => {
    if (withCoords.length === 0) return [22.5937, 78.9629];
    const avgLat = withCoords.reduce((sum, l) => sum + l.latitude, 0) / withCoords.length;
    const avgLng = withCoords.reduce((sum, l) => sum + l.longitude, 0) / withCoords.length;
    return [avgLat, avgLng];
  }, [withCoords]);

  const boundaryPath = useMemo(() => generateBoundaryPath(center, 4.5), [center]);

  return (
    <div className="h-full w-full overflow-hidden rounded-2xl border border-border">
      <MapContainer center={center} zoom={11} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitToListings listings={withCoords} />
        {withCoords.length > 0 && (
          <Polygon
            positions={boundaryPath}
            pathOptions={{ color: "#222222", weight: 2, dashArray: "6 6", fill: false, opacity: 0.75 }}
          />
        )}
        {withCoords.map((listing) => (
          <Marker
            key={listing.id}
            position={[listing.latitude, listing.longitude]}
            icon={pinIcon(listing.price_per_night, false)}
            eventHandlers={{ click: () => router.push(`/listings/${listing.id}`) }}
          />
        ))}
      </MapContainer>
    </div>
  );
}
