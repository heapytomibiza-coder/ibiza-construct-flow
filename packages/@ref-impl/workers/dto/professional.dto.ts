/**
 * Professional DTOs
 * @ref-impl/workers - Professional-specific data transfer objects
 * 
 * Supports Person or Business entity types
 */

/**
 * Professional entity type
 */
export type ProfessionalType = 'person' | 'business';

/**
 * Base professional fields (shared between Person and Business)
 */
export interface BaseProfessional {
  id: string;
  userId: string;
  type: ProfessionalType;
  services: string[];
  verificationStatus: 'pending' | 'verified' | 'rejected';
  rating?: number;
  reviewCount: number;
  completedJobs: number;
  responseRate?: number;
  responseTimeHours?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Person professional (individual)
 */
export interface PersonProfessional extends BaseProfessional {
  type: 'person';
  firstName: string;
  lastName: string;
  bio?: string;
  skills: string[];
  hourlyRate?: number;
  yearsExperience?: number;
}

/**
 * Business professional (company)
 */
export interface BusinessProfessional extends BaseProfessional {
  type: 'business';
  businessName: string;
  tradeName?: string;
  registrationNumber?: string;
  vatNumber?: string;
  employeeCount?: number;
  yearEstablished?: number;
  description?: string;
  insuranceDetails?: InsuranceInfo;
}

/**
 * Insurance information (for businesses)
 */
export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  coverageAmount: number;
  expiryDate: string;
}

/**
 * Union type for Professional
 */
export type Professional = PersonProfessional | BusinessProfessional;

/**
 * Worker display helper DTO
 * Derived type that avoids "if person else business" checks in UI
 */
export interface WorkerDisplay {
  id: string;
  type: ProfessionalType;
  displayName: string;
  avatarUrl?: string;
  rating?: number;
  reviewCount: number;
  verificationStatus: 'pending' | 'verified' | 'rejected';
}

/**
 * Convert Professional to WorkerDisplay
 */
export function toWorkerDisplay(p: Professional): WorkerDisplay {
  return {
    id: p.id,
    type: p.type,
    displayName: p.type === 'person' 
      ? `${p.firstName} ${p.lastName}` 
      : p.businessName,
    rating: p.rating,
    reviewCount: p.reviewCount,
    verificationStatus: p.verificationStatus,
  };
}

/**
 * Portfolio item
 */
export interface PortfolioItem {
  id: string;
  professionalId: string;
  title: string;
  description?: string;
  imageUrls: string[];
  categoryId?: string;
  completedDate?: string;
  createdAt: string;
}

/**
 * Earnings summary
 */
export interface EarningsSummary {
  totalEarnings: number;
  pendingPayouts: number;
  completedJobs: number;
  averageJobValue: number;
  period: 'week' | 'month' | 'year' | 'all';
}

/**
 * Availability slot
 */
export interface AvailabilitySlot {
  id: string;
  professionalId: string;
  dayOfWeek: number; // 0-6
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  isAvailable: boolean;
}
