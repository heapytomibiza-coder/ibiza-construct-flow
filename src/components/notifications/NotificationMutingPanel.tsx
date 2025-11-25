import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VolumeX, Trash2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

export const NotificationMutingPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch active muting rules
  const { data: mutingRules, isLoading } = useQuery({
    queryKey: ['muting-rules', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('notification_muting_rules')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Remove muting rule
  const removeMuting = useMutation({
    mutationFn: async (ruleId: string) => {
      const { error } = await supabase
        .from('notification_muting_rules')
        .update({ is_active: false })
        .eq('id', ruleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['muting-rules'] });
      toast({
        title: 'Muting Removed',
        description: 'Notifications will resume for this item',
      });
    },
  });

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  if (!mutingRules || mutingRules.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <VolumeX className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-lg font-semibold mb-2">No Muted Items</p>
          <p className="text-sm text-muted-foreground">
            You're receiving notifications from all sources
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <VolumeX className="w-5 h-5" />
          Muted Notifications
        </CardTitle>
        <CardDescription>
          Active notification muting rules
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {mutingRules.map((rule) => (
          <div
            key={rule.id}
            className="flex items-center justify-between p-3 rounded-lg bg-muted"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline">{rule.mute_type}</Badge>
                {rule.reason && (
                  <Badge variant="secondary">{rule.reason}</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Muting {rule.muted_categories?.join(', ') || 'all'} via {rule.muted_channels?.join(', ') || 'all channels'}
              </p>
              {rule.end_date && (
                <p className="text-xs text-muted-foreground mt-1">
                  Expires {formatDistanceToNow(new Date(rule.end_date), { addSuffix: true })}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeMuting.mutate(rule.id)}
              disabled={removeMuting.isPending}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
