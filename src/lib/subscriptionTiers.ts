/**
 * Subscription tier configuration
 * Maps Stripe product IDs to tier names and features
 */

export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    productId: null,
    commissionRate: 0.20,
    features: [
      'Post jobs for free',
      'Browse professionals',
      'Basic messaging',
      'Standard support'
    ]
  },
  basic: {
    name: 'Basic Professional',
    price: 40,
    priceId: 'price_1SXIVIH8naL2G8ZSMaL4g6M9',
    productId: 'prod_TUH3CcoWU6ElBp',
    commissionRate: 0.20,
    features: [
      'Accept job offers',
      'Basic profile',
      '20% commission per job',
      'Email support'
    ]
  },
  pro: {
    name: 'Pro Professional',
    price: 80,
    priceId: 'price_1SXIVhH8naL2G8ZSz4XA2iYR',
    productId: 'prod_TUH3WVIFUdA8XV',
    commissionRate: 0.15,
    features: [
      'Priority in search results',
      'Featured listing placement',
      '15% commission per job',
      'Advanced analytics',
      'Priority support'
    ]
  },
  premium: {
    name: 'Premium Professional',
    price: 180,
    priceId: 'price_1SXIWCH8naL2G8ZSTvdeJfxx',
    productId: 'prod_TUH4IBot7xGXOz',
    commissionRate: 0.08,
    features: [
      'Top search ranking',
      'Verified professional badge',
      '8% commission per job',
      'Advanced analytics',
      'Premium placement',
      'Dedicated support'
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
