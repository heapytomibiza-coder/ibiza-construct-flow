import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, FileText, CreditCard, Clock, CheckCircle, Star } from 'lucide-react';
import { useContracts } from '@/hooks/useContracts';
import { supabase } from '@/integrations/supabase/client';
import { ReviewSubmissionModal } from '@/components/reviews/ReviewSubmissionModal';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ClientPaymentSectionProps {
  userId: string;
}

export const ClientPaymentSection: React.FC<ClientPaymentSectionProps> = ({ userId }) => {
  const { contracts, loading } = useContracts({ userId, userRole: 'client' });
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);

  const handlePayment = async (contract: any) => {
    setProcessingPayment(contract.id);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          bookingRequestId: contract.job_id,
          amount: contract.agreed_amount,
          description: `Payment for ${contract.job?.title || 'Service'}`,
        },
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Failed to process payment');
    } finally {
      setProcessingPayment(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
      none: { label: 'Pending Payment', variant: 'outline' },
      pending: { label: 'Processing', variant: 'secondary' },
      held: { label: 'In Escrow', variant: 'default' },
      released: { label: 'Completed', variant: 'default' },
    };
    
    const config = variants[status] || variants.none;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Loading payments...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Payments & Contracts
          </CardTitle>
          <CardDescription>
            Manage your payments and view contract details
          </CardDescription>
        </CardHeader>
      </Card>

      {contracts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No contracts yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {contracts.map((contract) => (
            <Card key={contract.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">
                      {contract.job?.title || 'Service Contract'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      with {contract.tasker?.full_name}
                    </p>
                  </div>
                  {getStatusBadge(contract.escrow_status)}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Amount</p>
                    <p className="font-medium">${contract.agreed_amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-medium capitalize">{contract.type}</p>
                  </div>
                  {contract.start_at && (
                    <div>
                      <p className="text-muted-foreground">Start Date</p>
                      <p className="font-medium">
                        {format(new Date(contract.start_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  )}
                  {contract.end_at && (
                    <div>
                      <p className="text-muted-foreground">End Date</p>
                      <p className="font-medium">
                        {format(new Date(contract.end_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {contract.escrow_status === 'none' && (
                    <Button
                      onClick={() => handlePayment(contract)}
                      disabled={processingPayment === contract.id}
                      className="w-full"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      {processingPayment === contract.id ? 'Processing...' : 'Pay Now'}
                    </Button>
                  )}
                  {contract.escrow_status === 'held' && (
                    <div className="w-full p-3 bg-muted rounded-md flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Payment held in escrow</span>
                    </div>
                  )}
                  {contract.escrow_status === 'released' && (
                    <>
                      <div className="flex-1 p-3 bg-muted rounded-md flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Payment completed</span>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedContract(contract);
                          setReviewModalOpen(true);
                        }}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Leave Review
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedContract && (
        <ReviewSubmissionModal
          open={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedContract(null);
          }}
          contractId={selectedContract.id}
          professionalId={selectedContract.tasker_id}
          professionalName={selectedContract.tasker?.full_name || 'Professional'}
        />
      )}
    </div>
  );
};
