/**
 * Shared type contracts for the Post-a-Job flow
 * Ensures deterministic, auditable job creation
 */

export type WizardCompletePayload = {
  // Core job details
  title: string;
  description: string;
  location?: string;
  urgency?: string;

  // Project requirements (replaces menu-board)
  requirements?: {
    scope?: string;
    timeline?: string;
    budgetRange?: string;
    constraints?: string;
    materials?: string;
    specifications?: Record<string, any>;
    referenceImages?: Array<{ name: string; url: string }>;
  };

  // Critical identifiers (for audit & matching)
  serviceId?: string;      // UUID of the services_micro row
  microSlug: string;       // Stable slug (e.g., "plumbing-repairs-leak-fix")
  
  // Taxonomies (for display only)
  category?: string;
  subcategory?: string;
  micro?: string;

  // Structured answers
  microAnswers?: Record<string, any>;      // Layer 1: service-specific questions
  logisticsAnswers?: Record<string, any>;  // Layer 2: scheduling, location, etc.
  
  // Legacy/compatibility field
  generalAnswers?: Record<string, any>;
};

export type BookingCreateInput = {
  // Required fields
  client_id: string;
  title: string;
  description: string;
  service_id: string;
  
  // Audit tracking
  micro_slug: string;
  catalogue_version_used: number;
  locale: string;
  origin: string;
  
  // Job details
  status?: string;
  selected_items?: any;
  total_estimated_price?: number;
  preferred_dates?: any;
  location_details?: string;
  special_requirements?: string;
  
  // Question answers
  micro_q_answers?: any;
  general_answers?: any;
};
