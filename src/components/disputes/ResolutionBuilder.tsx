import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useMediation } from '@/hooks/useMediation';
import { Loader2, Scale, AlertCircle } from 'lucide-react';

interface ResolutionBuilderProps {
  disputeId: string;
}

export function ResolutionBuilder({ disputeId }: ResolutionBuilderProps) {
  const { propose } = useMediation(disputeId);
  const [resolutionType, setResolutionType] = useState('');
  const [clientFault, setClientFault] = useState(50);
  const [amount, setAmount] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [coolOffDays, setCoolOffDays] = useState(1);
  const [appealDays, setAppealDays] = useState(7);

  const professionalFault = 100 - clientFault;

  const isValid = resolutionType && reasoning.length >= 50;

  const handleSubmit = () => {
    if (!isValid) return;

    const now = new Date();
    const autoExecuteDate = new Date(now.getTime() + coolOffDays * 24 * 60 * 60 * 1000);
    const appealDeadline = new Date(now.getTime() + appealDays * 24 * 60 * 60 * 1000);

    propose.mutate({
      resolution_type: resolutionType,
      fault_percentage_client: clientFault,
      fault_percentage_professional: professionalFault,
      amount: amount ? parseFloat(amount) : undefined,
      mediator_decision_reasoning: reasoning,
      auto_execute_date: autoExecuteDate.toISOString(),
      appeal_deadline: appealDeadline.toISOString(),
      status: 'proposed',
      dispute_id: disputeId
    });
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="w-5 h-5" />
          Build Resolution
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Resolution Type</Label>
          <Select value={resolutionType} onValueChange={setResolutionType}>
            <SelectTrigger>
              <SelectValue placeholder="Select resolution type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full_refund">Full Refund</SelectItem>
              <SelectItem value="partial_refund">Partial Refund</SelectItem>
              <SelectItem value="revised_work">Revised Work/Redo</SelectItem>
              <SelectItem value="additional_payment">Additional Payment</SelectItem>
              <SelectItem value="compromise">Compromise Agreement</SelectItem>
              <SelectItem value="cancellation">Cancel Contract</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Fault Split</Label>
          <div className="space-y-2">
            <Slider
              value={[clientFault]}
              onValueChange={(values) => setClientFault(values[0])}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span>Client: {clientFault}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span>Professional: {professionalFault}%</span>
              </div>
            </div>
            <div className="flex w-full h-2 rounded-full overflow-hidden">
              <div 
                className="bg-blue-500" 
                style={{ width: `${clientFault}%` }}
              />
              <div 
                className="bg-purple-500" 
                style={{ width: `${professionalFault}%` }}
              />
            </div>
          </div>
        </div>

        {(resolutionType === 'full_refund' || 
          resolutionType === 'partial_refund' || 
          resolutionType === 'additional_payment') && (
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Mediator Reasoning (min 50 characters)</Label>
          <Textarea
            value={reasoning}
            onChange={(e) => setReasoning(e.target.value)}
            placeholder="Provide a clear, evidence-based explanation for this resolution..."
            rows={6}
          />
          <div className={`text-xs ${reasoning.length >= 50 ? 'text-green-500' : 'text-muted-foreground'}`}>
            {reasoning.length} / 50 characters
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Cooling-off Period (days)</Label>
            <Input
              type="number"
              value={coolOffDays}
              onChange={(e) => setCoolOffDays(parseInt(e.target.value) || 1)}
              min="1"
              max="30"
            />
            <div className="text-xs text-muted-foreground">
              Auto-execute after both parties agree
            </div>
          </div>
          <div className="space-y-2">
            <Label>Appeal Deadline (days)</Label>
            <Input
              type="number"
              value={appealDays}
              onChange={(e) => setAppealDays(parseInt(e.target.value) || 7)}
              min="1"
              max="30"
            />
            <div className="text-xs text-muted-foreground">
              Last date to appeal decision
            </div>
          </div>
        </div>

        {!isValid && (
          <div className="flex items-center gap-2 text-sm text-yellow-500 bg-yellow-500/10 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            <span>Please fill all required fields with valid data</span>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!isValid || propose.isPending}
          className="w-full"
        >
          {propose.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Proposing...
            </>
          ) : (
            'Propose Resolution'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
