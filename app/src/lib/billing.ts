// Billing system using Stripe
// Plans: Free, Pro ($19/user/month), Enterprise (custom)

export type PlanId = 'free' | 'pro' | 'enterprise';

export interface Plan {
  id: PlanId;
  name: string;
  price: number; // per user per month, AUD
  features: string[];
  limits: {
    sessions_per_month: number; // -1 = unlimited
    users: number; // -1 = unlimited
    custom_forms: boolean;
    export: boolean;
    reporting: boolean;
    sso: boolean;
    api_access: boolean;
    offline: boolean;
    analytics: boolean;
  };
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      'Up to 10 sessions per month',
      '1 user',
      'All standard form templates',
      'Near-miss & hazard reporting',
      'Export summaries & reports',
      'Voice-first AI conversations',
      'Weather integration',
    ],
    limits: {
      sessions_per_month: 10,
      users: 1,
      custom_forms: false,
      export: true,
      reporting: true,
      sso: false,
      api_access: false,
      offline: false,
      analytics: false,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 19,
    features: [
      'Unlimited sessions',
      'Organisation management',
      'Custom form templates',
      'Upload & distribute forms',
      'Contractor management',
      'Team dashboards',
      'Full analytics',
      'Offline mode',
      'CSV/PDF export',
      'Priority support',
    ],
    limits: {
      sessions_per_month: -1,
      users: -1,
      custom_forms: true,
      export: true,
      reporting: true,
      sso: false,
      api_access: false,
      offline: true,
      analytics: true,
    },
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: -1, // Custom pricing
    features: [
      'Everything in Pro',
      'SSO / SAML (Azure AD, Okta)',
      'API access & webhooks',
      'Dedicated account manager',
      'Custom integrations',
      'Data residency options',
      'Audit log access',
      'SLA guarantee',
    ],
    limits: {
      sessions_per_month: -1,
      users: -1,
      custom_forms: true,
      export: true,
      reporting: true,
      sso: true,
      api_access: true,
      offline: true,
      analytics: true,
    },
  },
};

// Feature gate check
export function canUseFeature(plan: PlanId, feature: keyof Plan['limits']): boolean {
  const planConfig = PLANS[plan];
  if (!planConfig) return false;
  const value = planConfig.limits[feature];
  if (typeof value === 'boolean') return value;
  return true;
}

export function isWithinSessionLimit(plan: PlanId, currentMonthSessions: number): boolean {
  const limit = PLANS[plan].limits.sessions_per_month;
  if (limit === -1) return true;
  return currentMonthSessions < limit;
}

export function getPlan(planId: PlanId): Plan {
  return PLANS[planId];
}

// Stripe integration helpers (server-side only)
// These would be used in API routes

export function getStripePriceId(planId: PlanId): string | null {
  // These would be real Stripe price IDs in production
  // Set via environment variables
  switch (planId) {
    case 'pro':
      return process.env.STRIPE_PRICE_PRO_MONTHLY || null;
    case 'enterprise':
      return process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || null;
    default:
      return null;
  }
}
