import { useCurrentSession } from '../../packages/@contracts/clients';

export type UnifiedRole = 'client' | 'professional' | 'admin';

export function useRole() {
  const { data: sessionData } = useCurrentSession();
  const session = sessionData?.data;
  
  return {
    active: session?.activeRole ?? null,
    isClient: session?.roles?.includes('client') ?? false,
    isProfessional: session?.roles?.includes('professional') ?? false,
    isAdmin: session?.roles?.includes('admin') ?? false,
    roles: session?.roles ?? [],
  };
}
