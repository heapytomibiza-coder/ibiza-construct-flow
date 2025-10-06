import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CalendarOff, Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface BlockedDatesManagerProps {
  professionalId: string;
}

export function BlockedDatesManager({ professionalId }: BlockedDatesManagerProps) {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reason, setReason] = useState('');
  const queryClient = useQueryClient();

  const { data: blockedDates = [], isLoading } = useQuery({
    queryKey: ['blocked-dates', professionalId],
    queryFn: async () => {
      const client: any = supabase;
      const { data, error } = await client
        .from('blocked_dates')
        .select('*')
        .eq('professional_id', professionalId)
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const addBlockedDateMutation = useMutation({
    mutationFn: async () => {
      if (!startDate) {
        throw new Error('Start date is required');
      }

      const client: any = supabase;
      const { error } = await client
        .from('blocked_dates')
        .insert({
          professional_id: professionalId,
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: endDate ? format(endDate, 'yyyy-MM-dd') : format(startDate, 'yyyy-MM-dd'),
          reason: reason || null
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-dates', professionalId] });
      toast.success('Blocked dates added');
      setStartDate(undefined);
      setEndDate(undefined);
      setReason('');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add blocked dates: ${error.message}`);
    },
  });

  const deleteBlockedDateMutation = useMutation({
    mutationFn: async (id: string) => {
      const client: any = supabase;
      const { error } = await client
        .from('blocked_dates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-dates', professionalId] });
      toast.success('Blocked dates removed');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove blocked dates: ${error.message}`);
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarOff className="h-5 w-5" />
          Blocked Dates
        </CardTitle>
        <CardDescription>
          Mark dates when you're unavailable (holidays, time off, etc.)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Blocked Period */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h4 className="font-semibold text-sm">Add Unavailable Period</h4>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </div>
            
            <div className="space-y-2">
              <Label>End Date (Optional)</Label>
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                disabled={(date) => !startDate || date < startDate}
                className="rounded-md border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              placeholder="e.g., Holiday, Personal time off..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
            />
          </div>

          <Button
            onClick={() => addBlockedDateMutation.mutate()}
            disabled={!startDate || addBlockedDateMutation.isPending}
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Blocked Period
          </Button>
        </div>

        {/* List of Blocked Dates */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Current Blocked Periods</h4>
          
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : blockedDates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No blocked dates</p>
          ) : (
            <div className="space-y-2">
              {blockedDates.map((blocked: any) => (
                <div
                  key={blocked.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {format(new Date(blocked.start_date), 'MMM dd, yyyy')}
                      {blocked.start_date !== blocked.end_date && (
                        <> - {format(new Date(blocked.end_date), 'MMM dd, yyyy')}</>
                      )}
                    </p>
                    {blocked.reason && (
                      <p className="text-xs text-muted-foreground">{blocked.reason}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteBlockedDateMutation.mutate(blocked.id)}
                    disabled={deleteBlockedDateMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
