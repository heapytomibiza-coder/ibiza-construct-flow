import { ReactNode } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminBreadcrumbs } from './AdminBreadcrumbs';
import { SidebarProvider } from '@/components/ui/sidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-neutral-50">
        <AdminSidebar />
        
        <main className="flex-1 flex flex-col">
          <header className="h-14 border-b bg-background flex items-center px-6">
            <AdminBreadcrumbs />
          </header>
          
          <div className="flex-1 p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
