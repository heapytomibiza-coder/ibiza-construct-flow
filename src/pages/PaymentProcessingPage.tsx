import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, DollarSign, Shield, ArrowLeft } from 'lucide-react';
import { getContractRoute } from '@/lib/navigation';

export default function PaymentProcessingPage() {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: contract, isLoading } = useQuery({
    queryKey: ['contract', contractId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', contractId)
        .single();

      if (error) throw error;

      // Fetch related data
      const [jobRes, proRes, milestonesRes] = await Promise.all([
        supabase.from('jobs').select('id, title').eq('id', data.job_id).maybeSingle(),
        supabase.from('profiles').select('id, full_name').eq('id', data.tasker_id).maybeSingle(),
        supabase.from('escrow_milestones').select('*').eq('contract_id', data.id),
      ]);

      return {
        ...data,
        job: jobRes.data,
        professional: proRes.data,
        milestones: milestonesRes.data || [],
      };
    },
  });

  const processPayment = useMutation({
    mutationFn: async () => {
      setIsProcessing(true);

      // Call payment processing edge function
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          contractId,
          amount: contract?.agreed_amount,
          paymentMethod,
        },
      });

      if (error) throw error;

      // Redirect to Stripe checkout
      if (data?.url) {
        window.open(data.url, '_blank');
      }

      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Payment initiated',
        description: 'Complete the payment in the new tab',
      });
      setTimeout(() => navigate(getContractRoute(contractId!)), 2000);
    },
    onError: (error: any) => {
      toast({
        title: 'Payment failed',
        description: error.message,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsProcessing(false);
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <Card className="p-6 h-96" />
        </div>
      </div>
    );
  }

  const totalAmount = contract?.agreed_amount || 0;
  const serviceFee = totalAmount * 0.05; // 5% service fee
  const totalCharge = totalAmount + serviceFee;

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Button
        variant="ghost"
        onClick={() => navigate(getContractRoute(contractId!))}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Contract
      </Button>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Fund Escrow</h1>
          <p className="text-muted-foreground">
            Secure payment for: {contract?.job?.title}
          </p>
        </div>

        <Card className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-blue-600">
              <Shield className="w-6 h-6" />
              <div>
                <p className="font-semibold">Secure Escrow Payment</p>
                <p className="text-sm text-muted-foreground">
                  Funds are held securely until work is completed
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between">
                <span>Contract Amount</span>
                <span className="font-semibold">€{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Service Fee (5%)</span>
                <span>€{serviceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total Amount</span>
                <span>€{totalCharge.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted">
                <RadioGroupItem value="stripe" id="stripe" />
                <Label htmlFor="stripe" className="flex items-center gap-2 cursor-pointer flex-1">
                  <CreditCard className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Credit/Debit Card</p>
                    <p className="text-sm text-muted-foreground">Powered by Stripe</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {contract?.milestones && contract.milestones.length > 0 && (
            <div className="space-y-2 pt-4 border-t">
              <Label>Payment Milestones</Label>
              <div className="space-y-2">
                {contract.milestones.map((milestone: any, idx: number) => (
                  <div key={milestone.id} className="flex justify-between text-sm p-2 bg-muted rounded">
                    <span>Milestone {idx + 1}</span>
                    <span className="font-medium">€{milestone.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>✓ Funds are held securely in escrow</p>
            <p>✓ Released only when work is approved</p>
            <p>✓ Dispute resolution available</p>
            <p>✓ Secure payment processing</p>
          </div>

          <Button
            onClick={() => processPayment.mutate()}
            disabled={isProcessing}
            className="w-full"
            size="lg"
          >
            <DollarSign className="w-5 h-5 mr-2" />
            {isProcessing ? 'Processing...' : `Pay €${totalCharge.toFixed(2)}`}
          </Button>
        </Card>
      </div>
    </div>
  );
}
