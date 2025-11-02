import { ReactNode } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminBreadcrumbs } from './AdminBreadcrumbs';
import { SidebarProvider } from '@/components/ui/sidebar';
import { EnhancedNotificationCenter } from '@/components/notifications/EnhancedNotificationCenter';
import { useAuth } from '@/hooks/useAuth';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useAuth();
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-neutral-50">
        {/* Hide sidebar on mobile (lg:block = show on desktop) */}
        <div className="hidden lg:block">
          <AdminSidebar />
        </div>
        
        <main className="flex-1 flex flex-col w-full">
          <header className="h-14 border-b bg-background flex items-center justify-between px-4 lg:px-6">
            <AdminBreadcrumbs />
            {user && <EnhancedNotificationCenter userId={user.id} />}
          </header>
          
          <div className="flex-1 p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
