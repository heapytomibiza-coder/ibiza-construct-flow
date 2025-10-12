/**
 * Centralized Route Configuration
 * Phase 11: Route Organization & Lazy Loading Implementation
 * 
 * Single source of truth for all application routes
 */

export const ROUTE_PATHS = {
  // Public Routes
  HOME: '/',
  CALCULATOR: '/calculator',
  DISCOVERY: '/discovery',
  JOBS_DISCOVERY: '/jobs-discovery',
  PROFESSIONALS: '/professionals',
  SPECIALIST_CATEGORIES: '/specialist-categories',
  HOW_IT_WORKS: '/how-it-works',
  CONTACT: '/contact',
  BOOKING: '/book',
  
  // Auth Routes
  AUTH: '/auth',
  VERIFY_EMAIL: '/auth/verify-email',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  AUTH_CALLBACK: '/auth/callback',
  QUICK_START: '/auth/quick-start',
  
  // Legal Routes
  TERMS: '/terms',
  PRIVACY: '/privacy',
  COOKIE_POLICY: '/cookie-policy',
  
  // Dashboard Routes
  DASHBOARD: '/dashboard',
  DASHBOARD_CLIENT: '/dashboard/client',
  DASHBOARD_PROFESSIONAL: '/dashboard/pro',
  DASHBOARD_ADMIN: '/dashboard/admin',
  
  // Job Routes
  POST_JOB: '/post',
  POST_JOB_SUCCESS: '/post/success',
  JOB_BOARD: '/job-board',
  JOB_DETAIL: '/jobs/:jobId',
  JOB_MATCHES: '/jobs/:jobId/matches',
  
  // Professional Routes
  PROFESSIONAL_PROFILE: '/professionals/:id',
  PROFESSIONAL_ONBOARDING: '/onboarding/professional',
  PROFESSIONAL_VERIFICATION: '/professional/verification',
  PROFESSIONAL_SERVICE_SETUP: '/professional/service-setup',
  PROFESSIONAL_PAYOUT_SETUP: '/professional/payout-setup',
  PROFESSIONAL_SERVICES: '/professional/services',
  PROFESSIONAL_PORTFOLIO: '/professional/portfolio',
  PROFESSIONAL_AVAILABILITY: '/availability',
  PROFESSIONAL_CALENDAR: '/calendar',
  PROFESSIONAL_EARNINGS: '/earnings',
  
  // Messaging Routes
  MESSAGES: '/messages',
  CONVERSATION: '/messages/:conversationId',
  MESSAGING: '/messaging',
  MESSAGING_CONVERSATION: '/messaging/:conversationId',
  
  // Payment Routes
  PAYMENT_SUCCESS: '/payment-success',
  PAYMENT_CANCELED: '/payment-canceled',
  SUBSCRIPTION_SUCCESS: '/subscription-success',
  SUBSCRIPTION_CANCELED: '/subscription-canceled',
  PAYMENTS: '/payments',
  
  // Contract Management Routes
  CONTRACTS: '/contracts',
  ESCROW: '/escrow',
  PAYMENT_PROCESSING: '/payment-processing',
  
  // Settings Routes
  SETTINGS: '/settings',
  SETTINGS_PROFILE: '/settings/profile',
  SETTINGS_ACCOUNT: '/settings/account',
  SETTINGS_NOTIFICATIONS: '/settings/notifications',
  SETTINGS_CLIENT: '/settings/client',
  SETTINGS_PROFESSIONAL: '/settings/professional',
  
  // Admin Routes
  ADMIN: '/admin',
  ADMIN_HOME: '/admin/home',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_USERS: '/admin/users',
  ADMIN_PROFILES_QUEUE: '/admin/profiles-queue',
  ADMIN_JOBS_QUEUE: '/admin/jobs-queue',
  ADMIN_REVIEWS_QUEUE: '/admin/reviews-queue',
  ADMIN_DISPUTES_QUEUE: '/admin/disputes-queue',
  ADMIN_SERVICES: '/admin/services',
  ADMIN_HEALTH: '/admin/health',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_QUESTIONS: '/admin/questions',
  ADMIN_PACKS: '/admin/packs',
  ADMIN_WEBSITE: '/admin/website',
  ADMIN_VERIFICATIONS: '/admin/verifications',
  ADMIN_DISPUTE_ANALYTICS: '/admin/dispute-analytics',
  ADMIN_DISPUTE_DETAIL: '/admin/disputes/:id',
  ADMIN_AUDIT_LOG: '/admin/audit-log',
  ADMIN_JOBS: '/admin/jobs',
  ADMIN_BOOKINGS: '/admin/bookings',
  ADMIN_DATABASE: '/admin/database',
  ADMIN_USER_INSPECTOR: '/admin/user-inspector',
  ADMIN_SERVICE_MANAGER: '/admin/service-manager',
  ADMIN_DOCUMENT_REVIEW: '/admin/document-review',
  ADMIN_FEATURE_FLAGS: '/admin/feature-flags',
  ADMIN_TEST_RUNNER: '/admin/test-runner',
  ADMIN_PROFILE_MODERATION: '/admin/profile-moderation',
  ADMIN_QUESTIONS_MANAGER: '/admin/questions-manager',
  ADMIN_HELPDESK: '/admin/helpdesk',
  ADMIN_HELPDESK_DETAIL: '/admin/helpdesk/:ticketId',
  ADMIN_REVIEW_MODERATION: '/admin/review-moderation',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_OVERVIEW: '/admin/overview',
  ADMIN_SECURITY: '/admin/security',
  ADMIN_INTELLIGENCE: '/admin/intelligence',
  ADMIN_INTEGRATIONS: '/admin/integrations',
  ADMIN_PERFORMANCE: '/admin/performance',
  ADMIN_CALCULATOR_SETTINGS: '/admin/calculator-settings',
  ADMIN_PRICING: '/admin/pricing',
  ADMIN_CALCULATOR_ANALYTICS: '/admin/calculator-analytics',
  
  // Utility Routes
  TEMPLATES: '/templates',
  COLOR_PREVIEW: '/color-preview',
  DESIGN_TEST: '/design-test',
  ROLE_SWITCHER: '/role-switcher',
  
  // Fallback
  NOT_FOUND: '*',
} as const;

/**
 * Route groups for easier management and preloading
 */
export const ROUTE_GROUPS = {
  PUBLIC: [
    ROUTE_PATHS.HOME,
    ROUTE_PATHS.CALCULATOR,
    ROUTE_PATHS.DISCOVERY,
    ROUTE_PATHS.PROFESSIONALS,
    ROUTE_PATHS.HOW_IT_WORKS,
    ROUTE_PATHS.CONTACT,
  ],
  
  AUTH: [
    ROUTE_PATHS.AUTH,
    ROUTE_PATHS.VERIFY_EMAIL,
    ROUTE_PATHS.FORGOT_PASSWORD,
    ROUTE_PATHS.RESET_PASSWORD,
  ],
  
  CLIENT: [
    ROUTE_PATHS.DASHBOARD_CLIENT,
    ROUTE_PATHS.POST_JOB,
    ROUTE_PATHS.PAYMENTS,
    ROUTE_PATHS.CONTRACTS,
  ],
  
  PROFESSIONAL: [
    ROUTE_PATHS.DASHBOARD_PROFESSIONAL,
    ROUTE_PATHS.JOB_BOARD,
    ROUTE_PATHS.PROFESSIONAL_SERVICES,
    ROUTE_PATHS.PROFESSIONAL_CALENDAR,
  ],
  
  ADMIN: [
    ROUTE_PATHS.ADMIN,
    ROUTE_PATHS.ADMIN_HOME,
    ROUTE_PATHS.ADMIN_ANALYTICS,
    ROUTE_PATHS.ADMIN_USERS,
  ],
} as const;

/**
 * Get dynamic route with parameters
 */
export const getRoute = {
  professionalProfile: (id: string) => `/professionals/${id}`,
  jobDetail: (jobId: string) => `/jobs/${jobId}`,
  jobMatches: (jobId: string) => `/jobs/${jobId}/matches`,
  conversation: (conversationId: string) => `/messages/${conversationId}`,
  messagingConversation: (conversationId: string) => `/messaging/${conversationId}`,
  adminDisputeDetail: (id: string) => `/admin/disputes/${id}`,
  adminHelpdeskDetail: (ticketId: string) => `/admin/helpdesk/${ticketId}`,
} as const;

/**
 * Route metadata for SEO and navigation
 */
export const ROUTE_META = {
  [ROUTE_PATHS.HOME]: {
    title: 'Home',
    description: 'Find trusted professionals for your projects',
  },
  [ROUTE_PATHS.CALCULATOR]: {
    title: 'Project Calculator',
    description: 'Estimate your project cost',
  },
  [ROUTE_PATHS.DISCOVERY]: {
    title: 'Discover Professionals',
    description: 'Browse our network of verified professionals',
  },
  [ROUTE_PATHS.HOW_IT_WORKS]: {
    title: 'How It Works',
    description: 'Learn how our platform connects clients with professionals',
  },
  [ROUTE_PATHS.CONTACT]: {
    title: 'Contact Us',
    description: 'Get in touch with our team',
  },
  // Add more as needed
} as const;
