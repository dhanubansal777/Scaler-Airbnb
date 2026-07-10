const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatINR(amount: number): string {
  return inrFormatter.format(amount);
}

// Shown on browse grids ("₹X for N nights") when the guest hasn't picked
// specific dates yet — mirrors a representative short-stay total.
export const DEFAULT_DISPLAY_NIGHTS = 5;
