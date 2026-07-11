export type FooterCategory = "popular" | "houses" | "apartments" | "cabins" | "villas" | "cottages";

export interface FooterDestination {
  city: string;
  label: string;
  query: string;
}

export interface FooterCategoryTab {
  key: FooterCategory;
  label: string;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterNavSection {
  title: string;
  links: FooterLink[];
}

/**
 * This app's search/explore experience lives at `/` (there is no separate
 * `/search` route), so destination links target `/?location=...` — the
 * real, working query the home page already reads.
 */
function destinationQuery(city: string, propertyType?: string): string {
  const params = new URLSearchParams({ location: city });
  if (propertyType) params.set("property_type", propertyType);
  return `/?${params.toString()}`;
}

export const FOOTER_CATEGORY_TABS: FooterCategoryTab[] = [
  { key: "popular", label: "Popular" },
  { key: "houses", label: "Houses" },
  { key: "apartments", label: "Apartments" },
  { key: "cabins", label: "Cabins" },
  { key: "villas", label: "Villas" },
  { key: "cottages", label: "Cottages" },
];

export const FOOTER_DESTINATIONS: Record<FooterCategory, FooterDestination[]> = {
  popular: [
    { city: "Mumbai", label: "Apartment rentals", query: destinationQuery("Mumbai") },
    { city: "New Delhi", label: "Villa rentals", query: destinationQuery("New Delhi") },
    { city: "Bengaluru", label: "Guesthouse rentals", query: destinationQuery("Bengaluru") },
    { city: "Goa", label: "Cottage rentals", query: destinationQuery("Goa") },
    { city: "Jaipur", label: "House rentals", query: destinationQuery("Jaipur") },
    { city: "Udaipur", label: "Apartment rentals", query: destinationQuery("Udaipur") },
    { city: "Gurugram", label: "Cabin rentals", query: destinationQuery("Gurugram") },
    { city: "Dehradun", label: "Entire place rentals", query: destinationQuery("Dehradun") },
  ],
  houses: [
    { city: "Jaipur", label: "House rentals", query: destinationQuery("Jaipur", "House") },
    { city: "Dehradun", label: "House rentals", query: destinationQuery("Dehradun", "House") },
    { city: "Bengaluru", label: "House rentals", query: destinationQuery("Bengaluru", "House") },
    { city: "Udaipur", label: "House rentals", query: destinationQuery("Udaipur", "House") },
  ],
  apartments: [
    { city: "Mumbai", label: "Apartment rentals", query: destinationQuery("Mumbai", "Apartment") },
    { city: "Gurugram", label: "Apartment rentals", query: destinationQuery("Gurugram", "Apartment") },
    { city: "New Delhi", label: "Apartment rentals", query: destinationQuery("New Delhi", "Apartment") },
    { city: "Bengaluru", label: "Apartment rentals", query: destinationQuery("Bengaluru", "Apartment") },
  ],
  cabins: [
    { city: "Dehradun", label: "Cabin rentals", query: destinationQuery("Dehradun", "Cabin") },
    { city: "Udaipur", label: "Cabin rentals", query: destinationQuery("Udaipur", "Cabin") },
    { city: "Gurugram", label: "Cabin rentals", query: destinationQuery("Gurugram", "Cabin") },
    { city: "Jaipur", label: "Cabin rentals", query: destinationQuery("Jaipur", "Cabin") },
  ],
  villas: [
    { city: "Goa", label: "Villa rentals", query: destinationQuery("Goa", "Villa") },
    { city: "Udaipur", label: "Villa rentals", query: destinationQuery("Udaipur", "Villa") },
    { city: "New Delhi", label: "Villa rentals", query: destinationQuery("New Delhi", "Villa") },
    { city: "Jaipur", label: "Villa rentals", query: destinationQuery("Jaipur", "Villa") },
  ],
  cottages: [
    { city: "Goa", label: "Cottage rentals", query: destinationQuery("Goa", "Cottage") },
    { city: "Dehradun", label: "Cottage rentals", query: destinationQuery("Dehradun", "Cottage") },
    { city: "Mumbai", label: "Cottage rentals", query: destinationQuery("Mumbai", "Cottage") },
    { city: "Bengaluru", label: "Cottage rentals", query: destinationQuery("Bengaluru", "Cottage") },
  ],
};

export const FOOTER_NAV_SECTIONS: FooterNavSection[] = [
  {
    title: "Explore",
    links: [
      { label: "Browse stays", href: "/" },
      { label: "Wishlist", href: "/wishlist" },
      { label: "My trips", href: "/trips" },
    ],
  },
  {
    title: "Hosting",
    links: [
      { label: "Become a host", href: "/host" },
      { label: "Host dashboard", href: "/host" },
      { label: "Create a listing", href: "/host/listings/new" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Centre", href: "/coming-soon?topic=Help+Centre" },
      { label: "Cancellation options", href: "/coming-soon?topic=Cancellation+options" },
      { label: "Safety information", href: "/coming-soon?topic=Safety+information" },
      { label: "Report a concern", href: "/coming-soon?topic=Report+a+concern" },
    ],
  },
];

export const FOOTER_LEGAL_LINKS: FooterLink[] = [
  { label: "Privacy", href: "/coming-soon?topic=Privacy" },
  { label: "Terms", href: "/coming-soon?topic=Terms" },
  { label: "Sitemap", href: "/coming-soon?topic=Sitemap" },
];
