import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface PaymentScheduleBuilderProps {
  jobId: string;
  totalAmount: number;
  currency?: string;
  onSuccess?: (scheduleId: string) => void;
}

export function PaymentScheduleBuilder({
  jobId,
  totalAmount,
  currency = 'EUR',
  onSuccess,
}: PaymentScheduleBuilderProps) {
  const [installmentCount, setInstallmentCount] = useState<number>(3);
  const [frequency, setFrequency] = useState<string>('monthly');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const installmentAmount = totalAmount / installmentCount;

  const handleCreateSchedule = async () => {
    if (!startDate) {
      toast({
        title: "Error",
        description: "Please select a start date",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase.rpc('create_payment_schedule', {
        p_job_id: jobId,
        p_total_amount: totalAmount,
        p_currency: currency,
        p_installment_count: installmentCount,
        p_frequency: frequency,
        p_start_date: startDate.toISOString(),
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Payment schedule created with ${installmentCount} installments`,
      });

      onSuccess?.(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create payment schedule",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set Up Payment Plan</CardTitle>
        <CardDescription>
          Split your payment into manageable installments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Total Amount</Label>
            <div className="text-2xl font-bold">
              {currency === 'EUR' ? '€' : '$'}{totalAmount.toFixed(2)}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Per Installment</Label>
            <div className="text-2xl font-bold text-primary">
              {currency === 'EUR' ? '€' : '$'}{installmentAmount.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="installments">Number of Installments</Label>
          <Select
            value={installmentCount.toString()}
            onValueChange={(value) => setInstallmentCount(Number(value))}
          >
            <SelectTrigger id="installments">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2 installments</SelectItem>
              <SelectItem value="3">3 installments</SelectItem>
              <SelectItem value="4">4 installments</SelectItem>
              <SelectItem value="6">6 installments</SelectItem>
              <SelectItem value="12">12 installments</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="frequency">Payment Frequency</Label>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger id="frequency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="biweekly">Bi-weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>First Payment Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="pt-4 border-t space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment Plan Summary</span>
          </div>
          <div className="text-sm">
            {installmentCount} payments of {currency === 'EUR' ? '€' : '$'}
            {installmentAmount.toFixed(2)} {frequency}
          </div>
        </div>

        <Button
          onClick={handleCreateSchedule}
          disabled={isCreating || !startDate}
          className="w-full"
          size="lg"
        >
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Schedule...
            </>
          ) : (
            'Create Payment Schedule'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
