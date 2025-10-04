/**
 * Subscription tier configuration
 * Maps Stripe product IDs to tier names and features
 */

export const SUBSCRIPTION_TIERS = {
  basic: {
    name: 'Basic',
    price: 0,
    priceId: null,
    productId: null,
    features: [
      'See jobs after 24 hours',
      'Manual job browsing',
      'Basic profile',
      'Standard support'
    ]
  },
  pro: {
    name: 'Pro',
    price: 29,
    priceId: 'price_1SETNQH8naL2G8ZS3GaSnpLY',
    productId: 'prod_TAp1bdyRCxlaAU',
    features: [
      'Instant job notifications',
      'See jobs 24 hours early',
      'Priority in search results',
      'Email support'
    ]
  },
  premium: {
    name: 'Premium',
    price: 99,
    priceId: 'price_1SETO1H8naL2G8ZSOkDaZgL6',
    productId: 'prod_TAp2xlyZAo489L',
    features: [
      'Everything in Pro',
      'Verified professional badge',
      'Advanced analytics',
      'Premium placement',
      'Priority support'
    ]
  }
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

export const getSubscriptionTier = (productId: string | null): SubscriptionTier => {
  if (!productId) return 'basic';
  
  for (const [tier, config] of Object.entries(SUBSCRIPTION_TIERS)) {
    if (config.productId === productId) {
      return tier as SubscriptionTier;
    }
  }
  
  return 'basic';
};
