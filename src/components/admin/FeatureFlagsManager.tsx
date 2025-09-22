import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Settings, Zap } from 'lucide-react';

interface FeatureFlag {
  key: string;
  enabled: boolean;
  description: string;
  updated_at: string;
}

const FeatureFlagsManager = () => {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadFlags = async () => {
      try {
        const { data, error } = await supabase
          .from('feature_flags')
          .select('*')
          .order('key');
        
        if (error) throw error;
        setFlags(data || []);
      } catch (error) {
        console.error('Error loading feature flags:', error);
        toast({
          title: "Error",
          description: "Failed to load feature flags",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadFlags();

    // Listen for real-time updates
    const channel = supabase
      .channel('feature_flags_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'feature_flags' },
        () => {
          loadFlags(); // Reload when any flag changes
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const toggleFlag = async (key: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('feature_flags')
        .update({ enabled, updated_at: new Date().toISOString() })
        .eq('key', key);

      if (error) throw error;

      toast({
        title: `Feature ${enabled ? 'Enabled' : 'Disabled'}`,
        description: `${key} has been ${enabled ? 'activated' : 'deactivated'}`,
      });

      // Update local state immediately for better UX
      setFlags(prev => prev.map(flag => 
        flag.key === key ? { ...flag, enabled } : flag
      ));
    } catch (error) {
      console.error('Error updating feature flag:', error);
      toast({
        title: "Error",
        description: "Failed to update feature flag",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Feature Flags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading feature flags...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Feature Flags Manager
          <Badge variant="outline" className="ml-auto">
            {flags.filter(f => f.enabled).length}/{flags.length} Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {flags.map((flag) => (
            <div 
              key={flag.key}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {flag.key}
                  </code>
                  {flag.enabled && (
                    <Zap className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {flag.description}
                </p>
              </div>
              <Switch
                checked={flag.enabled}
                onCheckedChange={(enabled) => toggleFlag(flag.key, enabled)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FeatureFlagsManager;