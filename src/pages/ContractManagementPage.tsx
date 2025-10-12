import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { FileText, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ReviewPrompt } from '@/components/reviews/ReviewPrompt';
import { getContractRoute } from '@/lib/navigation';

const statusColors = {
  pending: 'bg-yellow-500',
  active: 'bg-blue-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-500',
};

export default function ContractManagementPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user
  useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
      return user;
    },
  });

  const { data: contracts, isLoading } = useQuery({
    queryKey: ['contracts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .or(`client_id.eq.${user.id},tasker_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch related data separately
      const enrichedContracts = await Promise.all(
        data.map(async (contract) => {
          const [jobRes, clientRes, proRes, milestonesRes, reviewRes] = await Promise.all([
            supabase.from('jobs').select('id, title, description').eq('id', contract.job_id).maybeSingle(),
            supabase.from('profiles').select('id, full_name, avatar_url').eq('id', contract.client_id).maybeSingle(),
            supabase.from('profiles').select('id, full_name, avatar_url').eq('id', contract.tasker_id).maybeSingle(),
            supabase.from('escrow_milestones').select('*').eq('contract_id', contract.id),
            supabase.from('professional_reviews').select('id').eq('professional_id', contract.tasker_id).eq('client_id', user.id).maybeSingle(),
          ]);

          return {
            ...contract,
            job: jobRes.data,
            client: clientRes.data,
            professional: proRes.data,
            milestones: milestonesRes.data || [],
            hasReview: !!reviewRes.data,
          };
        })
      );

      return enrichedContracts;
    },
  });

  const filteredContracts = contracts?.filter(contract => {
    if (activeTab === 'all') return true;
    return contract.escrow_status === activeTab;
  });

  const calculateProgress = (milestones: any[]) => {
    if (!milestones || milestones.length === 0) return 0;
    const completed = milestones.filter(m => m.status === 'released').length;
    return (completed / milestones.length) * 100;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-6 h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Contracts</h1>
        <p className="text-muted-foreground">Manage payments and milestones</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="funded">Funded</TabsTrigger>
          <TabsTrigger value="released">Released</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredContracts?.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No contracts found</p>
            </Card>
          ) : (
            filteredContracts?.map(contract => {
              const progress = calculateProgress(contract.milestones);
              const isClient = contract.client_id === contract.client?.id;

              return (
                <Card key={contract.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Badge className={statusColors[contract.escrow_status as keyof typeof statusColors]}>
                            {contract.escrow_status}
                          </Badge>
                          <h3 className="text-xl font-semibold">{contract.job?.title}</h3>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          {contract.job?.description}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold">€{contract.agreed_amount}</p>
                        <p className="text-sm text-muted-foreground">{contract.type}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span>Created {formatDistanceToNow(new Date(contract.created_at))} ago</span>
                      </div>

                      {contract.professional && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {isClient ? 'Professional' : 'Client'}: 
                          </span>
                          <span>
                            {isClient ? contract.professional.full_name : contract.client.full_name}
                          </span>
                        </div>
                      )}
                    </div>

                    {contract.milestones && contract.milestones.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">Payment Progress</span>
                          <span>{Math.round(progress)}% Complete</span>
                        </div>
                        <Progress value={progress} />

                        <div className="grid grid-cols-3 gap-2 mt-3">
                          {contract.milestones.map((milestone: any, idx: number) => (
                            <div key={milestone.id} className="flex items-center gap-2 text-sm">
                              {milestone.status === 'released' ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : milestone.status === 'pending' ? (
                                <Clock className="w-4 h-4 text-yellow-500" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-red-500" />
                              )}
                              <span>Milestone {idx + 1}: €{milestone.amount}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Review Section - For Clients after contract completion */}
                    {contract.escrow_status === 'released' && 
                     currentUserId === contract.client_id && 
                     !contract.hasReview && 
                     contract.professional && (
                      <div className="mt-4 pt-4 border-t">
                        <ReviewPrompt
                          contractId={contract.id}
                          professionalId={contract.tasker_id}
                          professionalName={contract.professional.full_name}
                          onReviewSubmitted={() => queryClient.invalidateQueries({ queryKey: ['contracts'] })}
                        />
                      </div>
                    )}

                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        onClick={() => navigate(getContractRoute(contract.id))}
                        className="flex-1"
                      >
                        View Details
                      </Button>
                      {contract.escrow_status === 'pending' && isClient && (
                        <Button
                          onClick={() => navigate(getContractRoute(contract.id, 'fund'))}
                          variant="outline"
                        >
                          <DollarSign className="w-4 h-4 mr-2" />
                          Fund Escrow
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
