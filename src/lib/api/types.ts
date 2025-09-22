// Data contracts matching the integration playbook

export type UserSession = {
  userId: string;
  email: string;
  roles: Array<'asker'|'tasker'|'admin'>;
  verified: boolean;
};

export type WizardCategory = 'category'|'subcategory'|'micro'|'questions'|'review';

export type Question = {
  id: string;
  label: string;
  type: 'text'|'number'|'select'|'multi'|'file'|'date'|'boolean';
  required: boolean;
  options?: Array<{value: string; label: string}>;
  // conditionals supported by UI already:
  showIf?: { questionId: string; equals: string|number|boolean };
  // pricing weight is optional but supported
  priceImpact?: number;
};

export type ServiceMicro = {
  id: string;
  category: string;
  subcategory: string;
  micro: string;
  questions_micro: Question[];     // layer 1
  questions_logistics: Question[]; // layer 2
};

export type DraftJob = {
  id?: string;
  microId: string;
  answers: Record<string, any>; // includes both layers
  attachments?: Array<{name: string; url: string}>;
  // derived client-side for review step:
  priceEstimate?: number;
};

export type Job = {
  id: string;
  status: 'open'|'invited'|'offered'|'assigned'|'in_progress'|'complete_pending'|'complete'|'disputed'|'cancelled';
  clientId: string;
  microId: string;
  title: string;
  description: string;
  answers: Record<string, any>;
  budgetType: 'fixed'|'hourly';
  budgetValue: number | null;
  location?: { lat: number; lng: number; address: string };
  createdAt: string;
};

export type Offer = {
  id: string;
  jobId: string;
  taskerId: string;
  message?: string;
  amount: number;         // fixed, or hourlyRate
  type: 'fixed'|'hourly';
  status: 'sent'|'accepted'|'declined'|'withdrawn'|'expired';
  createdAt: string;
};

export type Contract = {
  id: string;
  jobId: string;
  taskerId: string;
  clientId: string;
  type: 'fixed'|'hourly';
  agreedAmount: number;
  escrowStatus: 'none'|'funded'|'released'|'refunded';
  startAt?: string;
  endAt?: string;
};

export type ApiResponse<T> = {
  data?: T;
  error?: string;
};