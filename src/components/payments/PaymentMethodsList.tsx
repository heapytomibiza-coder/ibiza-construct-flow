import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { CreditCard, Star, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface PaymentMethodsListProps {
  userId: string;
}

export const PaymentMethodsList = ({ userId }: PaymentMethodsListProps) => {
  const { paymentMethods, loading, setDefaultMethod, deleteMethod } = usePaymentMethods(userId);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (paymentMethods.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No payment methods</h3>
        <p className="text-muted-foreground">
          Add a payment method to get started with payments
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {paymentMethods.map((method) => (
        <Card key={method.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-hero flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium capitalize">
                    {method.brand} •••• {method.last4}
                  </p>
                  {method.is_default && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Default
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Expires {method.exp_month}/{method.exp_year}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!method.is_default && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDefaultMethod(method.id)}
                >
                  Set as Default
                </Button>
              )}
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove payment method</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to remove this payment method? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteMethod(method.id)}>
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
