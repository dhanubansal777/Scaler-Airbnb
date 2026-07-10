import {
  Wifi,
  ChefHat,
  ParkingCircle,
  Waves,
  Bath,
  Wind,
  WashingMachine,
  Tv,
  Laptop,
  Flame,
  Dumbbell,
  Mountain,
  PawPrint,
  Zap,
  UtensilsCrossed,
  Coffee,
  CheckCircle2,
} from "lucide-react";

export const AMENITY_ICON_MAP: Record<string, React.ElementType> = {
  wifi: Wifi,
  kitchen: ChefHat,
  parking: ParkingCircle,
  pool: Waves,
  "hot-tub": Bath,
  ac: Wind,
  washer: WashingMachine,
  dryer: WashingMachine,
  tv: Tv,
  workspace: Laptop,
  fireplace: Flame,
  gym: Dumbbell,
  "ocean-view": Waves,
  "mountain-view": Mountain,
  pets: PawPrint,
  "ev-charger": Zap,
  bbq: UtensilsCrossed,
  breakfast: Coffee,
};

export function AmenityIcon({ icon, size = 22 }: { icon: string; size?: number }) {
  const Icon = AMENITY_ICON_MAP[icon] || CheckCircle2;
  return <Icon size={size} strokeWidth={1.5} />;
}
