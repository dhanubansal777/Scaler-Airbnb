"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const pinIcon = L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#ff385c;border:3px solid white;box-shadow:0 0 0 1px rgba(0,0,0,0.2)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPicker({
  lat,
  lng,
  onChange,
}: {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}) {
  const center: [number, number] = lat && lng ? [lat, lng] : [22.5937, 78.9629];

  return (
    <div className="h-64 w-full overflow-hidden rounded-xl border border-border">
      <MapContainer center={center} zoom={lat && lng ? 12 : 4} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onPick={onChange} />
        {lat && lng ? <Marker position={[lat, lng]} icon={pinIcon} /> : null}
      </MapContainer>
    </div>
  );
}
