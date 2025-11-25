import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar, Video, Phone, MessageSquare, Clock } from 'lucide-react';
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
import { useMediation } from '@/hooks/disputes/useMediation';

interface MediationSchedulerProps {
  disputeId: string;
  onSuccess?: () => void;
}

interface FormData {
  session_type: string;
  scheduled_at: string;
  notes: string;
}

const sessionTypeIcons = {
  video: Video,
  phone: Phone,
  chat: MessageSquare,
  email: MessageSquare,
};

export function MediationScheduler({
  disputeId,
  onSuccess,
}: MediationSchedulerProps) {
  const [loading, setLoading] = useState(false);
  const { scheduleSession } = useMediation(disputeId);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();

  const sessionType = watch('session_type');
  const Icon = sessionType ? sessionTypeIcons[sessionType as keyof typeof sessionTypeIcons] : Calendar;

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await scheduleSession({
        dispute_id: disputeId,
        session_type: data.session_type,
        scheduled_at: data.scheduled_at,
        notes: data.notes,
        status: 'scheduled',
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error scheduling mediation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Schedule Mediation Session
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Session Type</Label>
            <Select
              onValueChange={(value) =>
                register('session_type').onChange({ target: { value } })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select session type">
                  {sessionType && (
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span className="capitalize">{sessionType}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Video Call
                  </div>
                </SelectItem>
                <SelectItem value="phone">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Call
                  </div>
                </SelectItem>
                <SelectItem value="chat">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Live Chat
                  </div>
                </SelectItem>
                <SelectItem value="email">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Email Exchange
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.session_type && (
              <p className="text-sm text-destructive mt-1">Required</p>
            )}
          </div>

          <div>
            <Label htmlFor="scheduled_at">
              <Clock className="w-4 h-4 inline mr-1" />
              Scheduled Date & Time
            </Label>
            <Input
              id="scheduled_at"
              type="datetime-local"
              {...register('scheduled_at', { required: true })}
            />
            {errors.scheduled_at && (
              <p className="text-sm text-destructive mt-1">Date & time required</p>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Session Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes or agenda items for the mediation session..."
              rows={3}
              {...register('notes')}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            <Calendar className="w-4 h-4 mr-2" />
            {loading ? 'Scheduling...' : 'Schedule Session'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
