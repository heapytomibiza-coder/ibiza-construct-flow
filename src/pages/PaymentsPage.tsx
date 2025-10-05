import { useAuth } from '@/hooks/useAuth';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PaymentMethodsManager } from '@/components/payments/PaymentMethodsManager';
import { PayoutManagement } from '@/components/payments/PayoutManagement';
import { ClientPaymentsView } from '@/components/client/ClientPaymentsView';
import { PaymentAnalyticsDashboard } from '@/components/analytics/PaymentAnalyticsDashboard';
import { NotificationPreferences } from '@/components/notifications/NotificationPreferences';
import { NotificationsList } from '@/components/notifications/NotificationsList';
import { CreditCard, Wallet, History, BarChart3, Bell, Settings } from 'lucide-react';

export const PaymentsPage = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  // Determine if user is a professional based on their active role
  // This would come from the user's profile in a real implementation
  const isProfessional = false; // Replace with actual role check

  return (
    <div className="min-h-screen bg-sand pt-20 pb-20">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs 
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Payments', href: '/payments' }
          ]} 
        />

        <div className="mt-6">
          <h1 className="text-3xl font-bold mb-2">Payments</h1>
          <p className="text-muted-foreground mb-6">
            Manage your payment methods, transactions, and {isProfessional ? 'payouts' : 'invoices'}
          </p>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="methods" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Payment Methods
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
              {isProfessional && (
                <TabsTrigger value="payouts" className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Payouts
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="overview">
              <ClientPaymentsView />
            </TabsContent>

            <TabsContent value="methods">
              <PaymentMethodsManager />
            </TabsContent>

            <TabsContent value="analytics">
              <PaymentAnalyticsDashboard />
            </TabsContent>

            <TabsContent value="notifications">
              <NotificationsList />
            </TabsContent>

            <TabsContent value="settings">
              <NotificationPreferences />
            </TabsContent>

            {isProfessional && (
              <TabsContent value="payouts">
                <PayoutManagement />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;
