import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Video, Phone, MessageSquare, Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DisputeMediationProps {
  disputeId: string;
}

export const DisputeMediation = ({ disputeId }: DisputeMediationProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sessionType, setSessionType] = useState<'video' | 'phone' | 'chat'>('video');
  const [sessionDate, setSessionDate] = useState<Date>();
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  const handleScheduleSession = async () => {
    if (!sessionDate) {
      toast({
        title: 'Date required',
        description: 'Please select a date for the mediation session',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase.from('dispute_mediations' as any).insert({
        dispute_id: disputeId,
        mediator_id: user.id,
        session_date: sessionDate.toISOString(),
        session_type: sessionType,
        notes,
        outcome: 'scheduled'
      } as any);

      if (error) throw error;

      toast({
        title: 'Session scheduled',
        description: 'Mediation session has been scheduled successfully'
      });

      setDialogOpen(false);
      setSessionDate(undefined);
      setNotes('');
    } catch (error: any) {
      console.error('Error scheduling session:', error);
      toast({
        title: 'Failed to schedule session',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'chat': return <MessageSquare className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Mediation</h3>
            <p className="text-sm text-muted-foreground">
              Schedule or manage mediation sessions
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <CalendarIcon className="h-4 w-4 mr-2" />
                Schedule Session
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Schedule Mediation Session</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Session Type</Label>
                  <Select
                    value={sessionType}
                    onValueChange={(value: any) => setSessionType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          Video Call
                        </div>
                      </SelectItem>
                      <SelectItem value="phone">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Phone Call
                        </div>
                      </SelectItem>
                      <SelectItem value="chat">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Chat Session
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Session Date</Label>
                  <Calendar
                    mode="single"
                    selected={sessionDate}
                    onSelect={setSessionDate}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any notes about the mediation session..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button onClick={handleScheduleSession} className="w-full">
                  Schedule Mediation
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>Mediation can help resolve disputes through facilitated communication.</p>
          <p className="mt-2">
            A neutral mediator will guide both parties through the resolution process.
          </p>
        </div>
      </div>
    </Card>
  );
};
