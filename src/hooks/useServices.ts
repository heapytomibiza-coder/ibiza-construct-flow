// Thin wrapper around ServicesRegistry for backward compatibility
import { useServicesRegistry } from '@/contexts/ServicesRegistry';

/**
 * @deprecated Use useServicesRegistry directly for new code
 * This hook is kept for backward compatibility
 */
export const useServices = () => {
  return useServicesRegistry();
};