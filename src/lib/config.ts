// Feature flags and configuration
export const config = {
  // When false: hide prices, require promo code, show waitlist on code failure
  pricingEnabled: process.env.NEXT_PUBLIC_PRICING_ENABLED !== "false",

  // Pricing display (for consistency across UI)
  singlePrice: "$9.99",
};
