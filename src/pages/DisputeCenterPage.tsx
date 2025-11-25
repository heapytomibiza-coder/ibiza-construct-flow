/**
 * Dispute Center Page
 * Main interface for viewing and managing disputes with Trust-First design
 */

import { useState, useEffect } from 'react';
import { useDisputes } from '@/hooks/useDisputes';
import { supabase } from '@/integrations/supabase/client';
import { DisputeCard } from '@/components/disputes/DisputeCard';
import { DisputeProgressTracker } from '@/components/disputes/DisputeProgressTracker';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, FileText, Scale, AlertCircle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DisputeCenterPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>();
  const { disputes, disputesLoading: isLoading } = useDisputes(userId);
  const [activeTab, setActiveTab] = useState<string>('all');

  // Get user ID
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  const filterDisputes = (status?: string) => {
    if (!disputes) return [];
    if (!status || status === 'all') return disputes;
    return disputes.filter(d => d.workflow_state === status);
  };

  const activeDisputes = filterDisputes('open');
  const resolvedDisputes = filterDisputes('resolved');

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Dispute Resolution Center</h1>
            <p className="text-muted-foreground mt-2">
              Professional, structured dispute resolution with full transparency and safety
            </p>
          </div>
          <Button size="lg" onClick={() => navigate('/disputes/create')}>
            <Plus className="w-4 h-4 mr-2" />
            File Dispute
          </Button>
        </div>

        {/* Trust-First Principles */}
        <Alert className="border-primary/20 bg-primary/5">
          <Shield className="h-4 w-4 text-primary" />
          <AlertTitle className="text-primary">Trust-First Resolution</AlertTitle>
          <AlertDescription className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-primary mt-0.5" />
                <div className="text-sm">
                  <strong>Evidence-Based:</strong> Both parties submit evidence equally
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Scale className="w-4 h-4 text-primary mt-0.5" />
                <div className="text-sm">
                  <strong>Neutral Platform:</strong> We facilitate, not judge
                </div>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-primary mt-0.5" />
                <div className="text-sm">
                  <strong>Payment Protected:</strong> Escrow frozen during resolution
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>

      {/* Stats */}
      {disputes && disputes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-lg border p-4">
            <div className="text-2xl font-bold">{disputes.length}</div>
            <div className="text-sm text-muted-foreground">Total Disputes</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-2xl font-bold text-orange-500">{activeDisputes.length}</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-2xl font-bold text-green-500">{resolvedDisputes.length}</div>
            <div className="text-sm text-muted-foreground">Resolved</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-2xl font-bold">
              {disputes.length > 0 ? Math.round((resolvedDisputes.length / disputes.length) * 100) : 0}%
            </div>
            <div className="text-sm text-muted-foreground">Resolution Rate</div>
          </div>
        </div>
      )}

      {/* Disputes List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">
            All ({disputes?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="open">
            Active ({activeDisputes.length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved ({resolvedDisputes.length})
          </TabsTrigger>
          <TabsTrigger value="closed">
            Closed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading disputes...</p>
            </div>
          ) : disputes && disputes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {disputes.map((dispute) => (
                <DisputeCard key={dispute.id} dispute={dispute} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No Disputes</h3>
              <p className="text-muted-foreground mb-4">
                You haven't filed or been involved in any disputes yet.
              </p>
              <Button onClick={() => navigate('/disputes/create')}>
                <Plus className="w-4 h-4 mr-2" />
                File a Dispute
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="open" className="mt-6">
          {activeDisputes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeDisputes.map((dispute) => (
                <DisputeCard key={dispute.id} dispute={dispute} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-muted-foreground">No active disputes</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="resolved" className="mt-6">
          {resolvedDisputes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resolvedDisputes.map((dispute) => (
                <DisputeCard key={dispute.id} dispute={dispute} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-muted-foreground">No resolved disputes</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="closed" className="mt-6">
          <div className="text-center py-12 border rounded-lg">
            <p className="text-muted-foreground">No closed disputes</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Progress Tracker Example (if there's an active dispute) */}
      {activeDisputes.length > 0 && (
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Dispute Resolution Process</h3>
          <DisputeProgressTracker currentStage={activeDisputes[0].stage} />
        </div>
      )}
    </div>
  );
}