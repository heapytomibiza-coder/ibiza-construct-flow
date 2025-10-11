import { ReactNode } from 'react';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { Loader2 } from 'lucide-react';

interface AdminGuardProps {
  children: ReactNode;
  redirectPath?: string;
}

export function AdminGuard({ children, redirectPath = '/' }: AdminGuardProps) {
  const { isAdmin, loading } = useAdminCheck(redirectPath);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}
