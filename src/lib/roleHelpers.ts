import { useCurrentSession } from '../../packages/@contracts/clients/auth';

export type UnifiedRole = 'asker' | 'tasker' | 'admin';

export function useRole() {
  const { data: sessionData } = useCurrentSession();
  const session = sessionData?.data;
  
  return {
    active: session?.activeRole ?? null,
    isAsker: session?.roles?.includes('asker') ?? false,
    isTasker: session?.roles?.includes('tasker') ?? false,
    isAdmin: session?.roles?.includes('admin') ?? false,
    roles: session?.roles ?? [],
  };
}
