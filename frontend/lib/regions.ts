export const REGION_CITIES: Record<string, string[]> = {
  "North India": ["New Delhi", "Jaipur", "Udaipur", "Gurugram", "Dehradun"],
  "West India": ["Mumbai", "Goa"],
  "South India": ["Bengaluru"],
};

const CITY_TO_REGION: Record<string, string> = Object.fromEntries(
  Object.entries(REGION_CITIES).flatMap(([region, cities]) => cities.map((city) => [city, region]))
);

const REGION_ORDER = Object.keys(REGION_CITIES);

export function regionForCity(city: string): string {
  return CITY_TO_REGION[city] ?? "India";
}

export function sortRegions(regions: string[]): string[] {
  return [...regions].sort((a, b) => {
    const ai = REGION_ORDER.indexOf(a);
    const bi = REGION_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}
