import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

export default function AdminDisputesPage() {
  const [activeTab, setActiveTab] = useState('open');

  const { data: disputes, isLoading } = useQuery({
    queryKey: ['admin-disputes', activeTab],
    queryFn: async () => {
      let query = supabase
        .from('disputes')
        .select('*')
        .order('created_at', { ascending: false });

      if (activeTab !== 'all') {
        query = query.eq('status', activeTab);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Fetch related data separately
      const disputesWithRelations = await Promise.all(
        (data || []).map(async (dispute) => {
          const [jobData, profileData] = await Promise.all([
            dispute.contract_id ? supabase.from('contracts').select('*, jobs(title)').eq('id', dispute.contract_id).single() : null,
            supabase.from('profiles').select('full_name, display_name').eq('id', dispute.created_by).single(),
          ]);
          
          return {
            ...dispute,
            job: jobData?.data?.jobs || null,
            profile: profileData?.data || null,
          };
        })
      );
      
      return disputesWithRelations;
    },
  });

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      low: 'secondary',
      medium: 'default',
      high: 'destructive',
      critical: 'destructive',
    };
    return colors[severity] || 'secondary';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <AlertTriangle className="h-8 w-8" />
          Dispute Management
        </h1>
        <p className="text-muted-foreground">Handle disputes and resolutions</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading disputes...</div>
            </div>
          ) : disputes?.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">No {activeTab} disputes</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {disputes?.map((dispute) => (
                <Card key={dispute.id}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{dispute.dispute_category?.replace('_', ' ')}</h3>
                            <Badge variant="outline">{dispute.status}</Badge>
                          </div>
                          <p className="text-sm">
                            Job: {(dispute as any).job?.title || 'Unknown'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Initiated by: {(dispute as any).profile?.full_name || (dispute as any).profile?.display_name || 'Unknown'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Created: {format(new Date(dispute.created_at), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </div>

                      {dispute.description && (
                        <div className="bg-muted p-3 rounded-md">
                          <p className="text-sm font-medium mb-1">Description:</p>
                          <p className="text-sm">{dispute.description}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
