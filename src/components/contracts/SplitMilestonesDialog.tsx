import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useContract } from '@/hooks/useContract';
import { Plus, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';

interface SplitMilestonesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string;
  totalAmount: number;
}

interface Phase {
  description: string;
  amount: string;
  due_date?: Date;
}

export function SplitMilestonesDialog({ 
  open, 
  onOpenChange, 
  contractId, 
  totalAmount 
}: SplitMilestonesDialogProps) {
  const { splitMilestone } = useContract();
  const [phases, setPhases] = useState<Phase[]>([
    { description: 'Phase 1', amount: '', due_date: undefined },
    { description: 'Phase 2', amount: '', due_date: undefined }
  ]);

  const addPhase = () => {
    setPhases([...phases, { 
      description: `Phase ${phases.length + 1}`, 
      amount: '', 
      due_date: undefined 
    }]);
  };

  const removePhase = (index: number) => {
    if (phases.length > 1) {
      setPhases(phases.filter((_, i) => i !== index));
    }
  };

  const updatePhase = (index: number, field: keyof Phase, value: any) => {
    const newPhases = [...phases];
    newPhases[index] = { ...newPhases[index], [field]: value };
    setPhases(newPhases);
  };

  const calculateTotal = () => {
    return phases.reduce((sum, phase) => {
      const amount = parseFloat(phase.amount) || 0;
      return sum + amount;
    }, 0);
  };

  const calculateRemaining = () => {
    return totalAmount - calculateTotal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const total = calculateTotal();
    if (Math.abs(total - totalAmount) > 0.01) {
      alert(`Phase amounts must total €${totalAmount.toFixed(2)}. Current total: €${total.toFixed(2)}`);
      return;
    }

    const formattedPhases = phases.map(phase => ({
      description: phase.description,
      amount: parseFloat(phase.amount),
      due_date: phase.due_date ? format(phase.due_date, 'yyyy-MM-dd') : undefined
    }));

    await splitMilestone.mutateAsync({
      contractId,
      phases: formattedPhases
    });

    onOpenChange(false);
  };

  const remaining = calculateRemaining();
  const isValid = Math.abs(remaining) < 0.01;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Split Payment into Milestones</DialogTitle>
          <DialogDescription>
            Divide the €{totalAmount.toFixed(2)} total into multiple payment phases
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {phases.map((phase, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Milestone {index + 1}</h4>
                {phases.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePhase(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={phase.description}
                  onChange={(e) => updatePhase(index, 'description', e.target.value)}
                  placeholder="e.g., Initial deposit, Mid-project payment, Final payment"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={phase.amount}
                    onChange={(e) => updatePhase(index, 'amount', e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Due Date (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {phase.due_date ? format(phase.due_date, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={phase.due_date}
                        onSelect={(date) => updatePhase(index, 'due_date', date)}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addPhase}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Milestone
          </Button>

          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Amount:</span>
              <span className="font-medium">€{totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Allocated:</span>
              <span className="font-medium">€{calculateTotal().toFixed(2)}</span>
            </div>
            <div className={`flex justify-between text-sm font-bold ${
              !isValid ? 'text-red-600' : 'text-green-600'
            }`}>
              <span>Remaining:</span>
              <span>€{remaining.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!isValid || splitMilestone.isPending}
            >
              {splitMilestone.isPending ? 'Creating...' : 'Create Milestones'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
