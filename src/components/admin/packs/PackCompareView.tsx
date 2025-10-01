/**
 * Comprehensive Pack Comparison View
 * Phase 4: Uses generated contract clients from @contracts/clients/packs
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertTriangle, XCircle, Download, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { calculateContentDiff, performHealthCheck, calculateRiskFlags } from '@/lib/packComparison';
import { ContentDiffPanel } from './compare/ContentDiffPanel';
import { HealthCheckPanel } from './compare/HealthCheckPanel';
import { MetricsPanel } from './compare/MetricsPanel';
import { useToast } from '@/hooks/use-toast';
import {
  useGetAdminPacksComparison,
  usePostAdminPacksApprove,
  usePostAdminPacksActivate,
} from '../../../../packages/@contracts/clients/packs';

export function PackCompareView() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('diff');

  // Use generated contract client
  const { data: comparison, isLoading } = useGetAdminPacksComparison(slug!);

  // Calculate derived data
  const contentDiff = comparison?.active || comparison?.draft 
    ? calculateContentDiff(comparison.active?.content, comparison.draft?.content)
    : null;

  const activeHealth = comparison?.active 
    ? performHealthCheck(comparison.active.content)
    : null;

  const draftHealth = comparison?.draft 
    ? performHealthCheck(comparison.draft.content)
    : null;

  const riskFlags = comparison?.draft 
    ? calculateRiskFlags(comparison.draft.content, draftHealth, contentDiff)
    : null;

  // Use generated contract clients (automatic cache invalidation)
  const approveMutation = usePostAdminPacksApprove({
    onSuccess: () => {
      toast({ title: 'Pack approved', description: 'Draft has been approved successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Approval failed', description: error.message, variant: 'destructive' });
    },
  });

  const activateMutation = usePostAdminPacksActivate({
    onSuccess: () => {
      toast({ title: 'Pack activated', description: 'Pack is now live for users' });
    },
    onError: (error: Error) => {
      toast({ title: 'Activation failed', description: error.message, variant: 'destructive' });
    },
  });

  const handleExport = () => {
    if (!comparison?.draft) return;
    const dataStr = JSON.stringify(comparison.draft.content, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${slug}_v${comparison.draft.version}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!comparison) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertDescription>Comparison data not found for slug: {slug}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const hasDraft = !!comparison.draft;
  const canApprove = hasDraft && comparison.draft.status === 'draft';
  const canActivate = comparison.draft?.status === 'approved' && !comparison.draft?.is_active;

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/questions')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{slug}</h1>
            <p className="text-muted-foreground">
              {comparison.active?.content.category} / {comparison.active?.content.name || comparison.draft?.content.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {draftHealth?.schemaValid && (
            <Badge variant="outline" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Schema Valid
            </Badge>
          )}
          {draftHealth?.i18nCoverage && (
            <Badge variant="outline">
              i18n: {Math.round(draftHealth.i18nCoverage.en * 100)}% EN / {Math.round(draftHealth.i18nCoverage.es * 100)}% ES
            </Badge>
          )}
          {draftHealth?.patternCompliance.valid && (
            <Badge variant="outline" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Pattern OK
            </Badge>
          )}
        </div>
      </div>

      {/* Risk Flags Alert */}
      {riskFlags && riskFlags.messages.length > 0 && (
        <Alert variant={riskFlags.severity === 'high' ? 'destructive' : 'default'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-2">Quality Checks ({riskFlags.severity} severity)</div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {riskFlags.messages.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="diff">Content Diff</TabsTrigger>
          <TabsTrigger value="metrics">Usage Metrics</TabsTrigger>
          <TabsTrigger value="history">Version History</TabsTrigger>
        </TabsList>

        <TabsContent value="diff" className="space-y-4">
          <ContentDiffPanel
            contentDiff={contentDiff}
            activeContent={comparison.active?.content}
            draftContent={comparison.draft?.content}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <HealthCheckPanel title="Active Pack Health" health={activeHealth} />
            <HealthCheckPanel title="Draft Pack Health" health={draftHealth} />
          </div>
        </TabsContent>

        <TabsContent value="metrics">
          <MetricsPanel metrics={comparison.metrics} />
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Version History</CardTitle>
              <CardDescription>All versions for {slug}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {comparison.versionHistory.map((v: any) => (
                  <div key={v.version} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <span className="font-mono">v{v.version}</span>
                      <Badge variant="outline" className="ml-2">{v.status}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(v.created_at).toLocaleDateString()}
                      {v.approved_at && ` • Approved ${new Date(v.approved_at).toLocaleDateString()}`}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Footer */}
      {hasDraft && (
        <Card className="sticky bottom-4 shadow-lg border-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled
                >
                  <Eye className="h-4 w-4" />
                  Wizard Preview
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {canApprove && (
                  <Button
                    onClick={() => approveMutation.mutate({ packId: comparison.draft.pack_id })}
                    disabled={approveMutation.isPending || riskFlags?.severity === 'high'}
                    className="gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Approve Draft
                  </Button>
                )}
                
                {canActivate && (
                  <Button
                    onClick={() => activateMutation.mutate({ packId: comparison.draft.pack_id })}
                    disabled={activateMutation.isPending}
                    variant="default"
                    className="gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Activate & Go Live
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
