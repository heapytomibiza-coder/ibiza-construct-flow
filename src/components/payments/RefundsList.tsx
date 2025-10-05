import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRefunds } from '@/hooks/useRefunds';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { XCircle, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export const RefundsList = () => {
  const { user } = useAuth();
  const { refunds, loading, cancelRefundRequest } = useRefunds(user?.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed': return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'approved': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      case 'pending': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      case 'rejected': return 'bg-red-500/10 text-red-700 dark:text-red-400';
      default: return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Refund Requests</CardTitle>
          <CardDescription>Loading refund requests...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Refund Requests</CardTitle>
        <CardDescription>Track the status of your refund requests</CardDescription>
      </CardHeader>
      <CardContent>
        {refunds.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No refund requests found
          </div>
        ) : (
          <div className="space-y-3">
            {refunds.map((refund) => (
              <div
                key={refund.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="p-2 bg-muted rounded-lg">
                    {getStatusIcon(refund.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">Refund Request</p>
                      <Badge className={getStatusColor(refund.status)}>
                        {refund.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {format(new Date(refund.created_at), 'MMM dd, yyyy • HH:mm')}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {refund.reason}
                    </p>
                    {refund.admin_notes && (
                      <p className="text-sm text-muted-foreground mt-1">
                        <span className="font-medium">Admin Note:</span> {refund.admin_notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      ${refund.amount.toFixed(2)}
                    </p>
                    {refund.processed_at && (
                      <p className="text-xs text-muted-foreground">
                        Processed {format(new Date(refund.processed_at), 'MMM dd')}
                      </p>
                    )}
                  </div>
                  {refund.status === 'pending' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Refund Request</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to cancel this refund request? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>No, keep it</AlertDialogCancel>
                          <AlertDialogAction onClick={() => cancelRefundRequest(refund.id)}>
                            Yes, cancel request
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
