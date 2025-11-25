import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { DollarSign, Calendar, FileText, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCounterProposals } from '@/hooks/disputes/useCounterProposals';

interface CounterProposalFormProps {
  disputeId: string;
  onSuccess?: () => void;
}

interface FormData {
  proposal_type: string;
  amount: number;
  currency: string;
  notes: string;
  expires_days: number;
}

export function CounterProposalForm({
  disputeId,
  onSuccess,
}: CounterProposalFormProps) {
  const [loading, setLoading] = useState(false);
  const { createProposal } = useCounterProposals(disputeId);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      currency: 'EUR',
      expires_days: 7,
    },
  });

  const proposalType = watch('proposal_type');

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + data.expires_days);

      await createProposal({
        dispute_id: disputeId,
        proposed_by: '', // Will be set by RLS/auth
        proposal_type: data.proposal_type,
        amount: data.amount,
        currency: data.currency,
        notes: data.notes,
        expires_at: expiresAt.toISOString(),
        terms: {
          expires_days: data.expires_days,
        },
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error creating proposal:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Create Counter-Proposal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Proposal Type</Label>
            <Select
              onValueChange={(value) =>
                register('proposal_type').onChange({ target: { value } })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="settlement">Settlement Offer</SelectItem>
                <SelectItem value="payment_plan">Payment Plan</SelectItem>
                <SelectItem value="scope_change">Scope Change</SelectItem>
                <SelectItem value="timeline_adjustment">
                  Timeline Adjustment
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.proposal_type && (
              <p className="text-sm text-destructive mt-1">Required</p>
            )}
          </div>

          {proposalType && ['settlement', 'payment_plan'].includes(proposalType) && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  {...register('amount', { required: true, min: 0 })}
                />
                {errors.amount && (
                  <p className="text-sm text-destructive mt-1">
                    Valid amount required
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select
                  defaultValue="EUR"
                  onValueChange={(value) =>
                    register('currency').onChange({ target: { value } })
                  }
                >
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="expires_days">
              <Calendar className="w-4 h-4 inline mr-1" />
              Valid for (days)
            </Label>
            <Input
              id="expires_days"
              type="number"
              {...register('expires_days', { required: true, min: 1, max: 30 })}
            />
            {errors.expires_days && (
              <p className="text-sm text-destructive mt-1">1-30 days required</p>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Proposal Details</Label>
            <Textarea
              id="notes"
              placeholder="Explain your proposal terms and conditions..."
              rows={4}
              {...register('notes', { required: true })}
            />
            {errors.notes && (
              <p className="text-sm text-destructive mt-1">Details required</p>
            )}
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            <Send className="w-4 h-4 mr-2" />
            {loading ? 'Sending...' : 'Send Proposal'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
