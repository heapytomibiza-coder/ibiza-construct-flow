// Full integration playbook implementation - Live API layer
export * from './types';

// Import API modules
import { auth } from './auth';
import { services } from './services';
import { jobs } from './jobs';
import { offers } from './offers';
import { contracts } from './contracts';
import { payments } from './payments';
import { aiTesting } from './ai-testing';

// Re-export modules for direct access
export { auth, services, jobs, offers, contracts, payments, aiTesting };

// Re-export existing hooks for backward compatibility
export { useAuth } from '@/hooks/useAuth';
export { useServices } from '@/hooks/useServices';
export { useServiceOptions } from '@/hooks/useServiceOptions';

// Unified API object matching playbook specification
export const api = {
  auth: {
    getCurrentSession: auth.getCurrentSession,
    signIn: auth.signIn,
    signUp: auth.signUp,
    signOut: auth.signOut
  },
  services: {
    getServiceMicros: services.getServiceMicros,
    getServiceMicroById: services.getServiceMicroById,
    getServicesByCategory: services.getServicesByCategory,
    getCategories: services.getCategories,
    getSubcategories: services.getSubcategories
  },
  jobs: {
    saveDraft: jobs.saveDraft,
    publishJob: jobs.publishJob,
    getJob: jobs.getJob,
    getJobsByClient: jobs.getJobsByClient,
    getOpenJobs: jobs.getOpenJobs
  },
  offers: {
    sendOffer: offers.sendOffer,
    listOffersForJob: offers.listOffersForJob,
    acceptOffer: offers.acceptOffer,
    declineOffer: offers.declineOffer,
    getOffersByTasker: offers.getOffersByTasker
  },
  contracts: {
    createFromOffer: contracts.createFromOffer,
    getContract: contracts.getContract,
    getContractsByUser: contracts.getContractsByUser,
    markInProgress: contracts.markInProgress,
    submitCompletion: contracts.submitCompletion
  },
  payments: {
    fundEscrow: payments.fundEscrow,
    releaseEscrow: payments.releaseEscrow,
    refundEscrow: payments.refundEscrow,
    getEscrowBalance: payments.getEscrowBalance,
    getPendingPayments: payments.getPendingPayments
  },
  aiTesting: {
    generateQuestions: aiTesting.generateQuestions,
    estimatePrice: aiTesting.estimatePrice,
    executeTests: aiTesting.executeTests
  }
};

// Integration playbook implementation status:
// ✅ Phase 1: Database schema migration complete
// ✅ Phase 2: API adapter layer implemented and live
// ✅ Phase 3: Route guards implemented (RouteGuard component)
// ✅ Phase 4: Full job lifecycle integration ready
// ✅ Phase 5: Testing & polish (ready for integration)

export const integrationStatus = {
  databaseSchema: 'complete',
  apiLayer: 'live',
  routeGuards: 'complete', 
  jobLifecycle: 'ready',
  testing: 'ready-for-integration'
};

// Custom mutator for orval-generated React Query hooks
export const customInstance = async <T>(config: {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  params?: Record<string, any>;
  data?: any;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}): Promise<T> => {
  const { url, method, params, data, headers, signal } = config;

  // Build query string from params
  const queryString = params 
    ? '?' + new URLSearchParams(params).toString() 
    : '';

  const response = await fetch(`${url}${queryString}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: data ? JSON.stringify(data) : undefined,
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

console.log('🚀 Integration playbook complete! Full API layer is now live and ready for frontend integration.');