"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function MapView({ lat, lng }: { lat: number; lng: number }) {
  useEffect(() => {
    document.documentElement.style.setProperty("--leaflet-ready", "1");
  }, []);

  if (!lat || !lng) return null;

  return (
    <div className="h-80 w-full overflow-hidden rounded-2xl border border-border">
      <MapContainer center={[lat, lng]} zoom={13} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Circle center={[lat, lng]} radius={800} pathOptions={{ color: "#ff385c", fillColor: "#ff385c", fillOpacity: 0.15 }} />
      </MapContainer>
    </div>
  );
}
