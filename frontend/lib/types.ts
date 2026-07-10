export interface User {
  id: number;
  email: string;
  name: string;
  avatar_url: string;
  is_host: boolean;
  is_superhost: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Amenity {
  id: number;
  name: string;
  icon: string;
}

export interface ListingPhoto {
  id: number;
  url: string;
  sort_order: number;
}

export interface Host {
  id: number;
  name: string;
  avatar_url: string;
  is_superhost: boolean;
  created_at: string;
}

export interface ListingCard {
  id: number;
  title: string;
  city: string;
  state: string;
  country: string;
  property_type: string;
  room_type: string;
  price_per_night: number;
  cover_photo: string | null;
  avg_rating: number;
  review_count: number;
  is_favorited: boolean;
}

export interface HostListing extends ListingCard {
  booking_count: number;
}

export interface BookedRange {
  check_in: string;
  check_out: string;
}

export interface ListingDetail {
  id: number;
  title: string;
  description: string;
  property_type: string;
  room_type: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  price_per_night: number;
  cleaning_fee: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  created_at: string;
  photos: ListingPhoto[];
  amenities: Amenity[];
  host: Host;
  avg_rating: number;
  review_count: number;
  is_favorited: boolean;
  booked_ranges: BookedRange[];
}

export interface PaginatedListings {
  items: ListingCard[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface BookingListingSummary {
  id: number;
  title: string;
  city: string;
  state: string;
  cover_photo: string | null;
}

export interface Booking {
  id: number;
  listing_id: number;
  check_in: string;
  check_out: string;
  guests_count: number;
  nightly_rate_snapshot: number;
  cleaning_fee_snapshot: number;
  service_fee_snapshot: number;
  total_price: number;
  status: "confirmed" | "cancelled";
  created_at: string;
  listing: BookingListingSummary | null;
  has_review: boolean;
}

export interface HostBooking extends Booking {
  guest: { id: number; name: string; avatar_url: string };
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  author: { id: number; name: string; avatar_url: string };
}

export const PROPERTY_TYPES = ["House", "Apartment", "Guesthouse", "Cabin", "Villa", "Loft", "Cottage"];
export const ROOM_TYPES = ["Entire place", "Private room", "Shared room"];
