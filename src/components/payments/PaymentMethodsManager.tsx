import { useAuth } from '@/hooks/useAuth';
import { PaymentMethodsList } from './PaymentMethodsList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const PaymentMethodsManager = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
        <CardDescription>
          Manage your saved payment methods
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PaymentMethodsList userId={user.id} />
      </CardContent>
    </Card>
  );
};
