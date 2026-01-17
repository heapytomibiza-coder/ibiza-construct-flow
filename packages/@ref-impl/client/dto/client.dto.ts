/**
 * Client DTOs
 * @ref-impl/client - Client-specific data transfer objects
 */

/**
 * Draft job (before submission)
 */
export interface DraftJob {
  id?: string;
  title: string;
  description: string;
  categoryId: string;
  subcategoryId?: string;
  budgetMin?: number;
  budgetMax?: number;
  location?: JobLocation;
  preferredDates?: string[];
  attachments?: string[];
  status: 'draft';
}

/**
 * Job location
 */
export interface JobLocation {
  address?: string;
  city?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Submitted job
 */
export interface Job extends Omit<DraftJob, 'status'> {
  id: string;
  clientId: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  offersCount?: number;
  selectedProfessionalId?: string;
}

/**
 * Booking
 */
export interface Booking {
  id: string;
  jobId: string;
  clientId: string;
  professionalId: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  scheduledDate: string;
  agreedPrice: number;
  notes?: string;
  createdAt: string;
}

/**
 * Offer from professional
 */
export interface Offer {
  id: string;
  jobId: string;
  professionalId: string;
  price: number;
  message?: string;
  estimatedDuration?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  createdAt: string;
}
