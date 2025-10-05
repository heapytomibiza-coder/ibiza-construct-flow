import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useProfessionalAvailability } from '@/hooks/useProfessionalAvailability';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface AvailabilityManagerProps {
  professionalId: string;
}

const AvailabilityManager: React.FC<AvailabilityManagerProps> = ({ professionalId }) => {
  const { availability, updateAvailability, loading } = useProfessionalAvailability(professionalId);
  const { toast } = useToast();
  
  const [status, setStatus] = useState<string>(
    availability?.status || 'offline'
  );
  const [customMessage, setCustomMessage] = useState(availability?.custom_message || '');
  const [availableUntil, setAvailableUntil] = useState<Date | undefined>(
    availability?.available_until ? new Date(availability.available_until) : undefined
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateAvailability({
        status: status as any,
        custom_message: customMessage,
        available_until: availableUntil?.toISOString()
      });
      toast({
        title: 'Availability Updated',
        description: 'Your availability status has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to update availability. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const quickActions = [
    { status: 'available', label: 'Available Now', icon: '✅' },
    { status: 'busy', label: 'Busy', icon: '⚠️' },
    { status: 'away', label: 'Away', icon: '🕐' },
    { status: 'offline', label: 'Offline', icon: '⭕' },
  ];

  if (loading) {
    return <Card><CardContent className="p-6">Loading...</CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Manage Your Availability
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Actions */}
        <div>
          <Label className="mb-3 block">Quick Actions</Label>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => (
              <Button
                key={action.status}
                variant={status === action.status ? 'default' : 'outline'}
                onClick={() => setStatus(action.status)}
                className="justify-start"
              >
                <span className="mr-2">{action.icon}</span>
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Status Selection */}
        <div className="space-y-3">
          <Label>Status</Label>
          <RadioGroup value={status} onValueChange={setStatus}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="available" id="available" />
              <Label htmlFor="available" className="cursor-pointer">Available - Ready to take new jobs</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="busy" id="busy" />
              <Label htmlFor="busy" className="cursor-pointer">Busy - Can respond but limited availability</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="away" id="away" />
              <Label htmlFor="away" className="cursor-pointer">Away - Temporarily unavailable</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="offline" id="offline" />
              <Label htmlFor="offline" className="cursor-pointer">Offline - Not accepting new jobs</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Custom Message */}
        <div className="space-y-2">
          <Label htmlFor="message">Custom Status Message (Optional)</Label>
          <Input
            id="message"
            placeholder="e.g., Back in 2 hours, On a job site..."
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            maxLength={100}
          />
          <p className="text-xs text-muted-foreground">
            {customMessage.length}/100 characters
          </p>
        </div>

        {/* Available Until */}
        <div className="space-y-2">
          <Label>Available Until (Optional)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {availableUntil ? format(availableUntil, 'PPP p') : 'No end time set'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={availableUntil}
                onSelect={setAvailableUntil}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {availableUntil && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAvailableUntil(undefined)}
            >
              Clear end time
            </Button>
          )}
        </div>

        {/* Save Button */}
        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? 'Saving...' : 'Update Availability'}
        </Button>

        {/* Current Status Info */}
        {availability && (
          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="font-medium">Current Status</p>
            <p className="text-muted-foreground">
              Last updated: {format(new Date(availability.updated_at), 'PPp')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AvailabilityManager;
