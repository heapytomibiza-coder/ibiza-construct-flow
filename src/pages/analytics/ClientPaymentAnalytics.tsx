import { useAuth } from '@/hooks/useAuth';
import { BackButton } from '@/components/navigation/BackButton';
import { PaymentAnalyticsDashboard } from '@/components/analytics/PaymentAnalyticsDashboard';
import { CreditCard } from 'lucide-react';

export default function ClientPaymentAnalytics() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <BackButton fallbackPath="/dashboard/client/analytics" />
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CreditCard className="h-8 w-8 text-blue-600" />
            Payment & Budget Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your spending, budget allocation, and payment history
          </p>
        </div>
      </div>

      <PaymentAnalyticsDashboard />
    </div>
  );
}
