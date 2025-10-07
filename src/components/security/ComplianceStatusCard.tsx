import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useComplianceStatus } from '@/hooks/useComplianceStatus';
import { CheckCircle, AlertCircle, FileCheck, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

export const ComplianceStatusCard = () => {
  const { frameworks, userCompliance, isLoading, checkCompliance, generateReport } = useComplianceStatus();

  const handleCheckCompliance = async (frameworkCode: string) => {
    try {
      const result = await checkCompliance(frameworkCode);
      toast.success(`Compliance check complete: ${result.score}% compliant`);
    } catch (error) {
      toast.error('Failed to check compliance');
    }
  };

  const handleGenerateReport = async (frameworkCode: string) => {
    try {
      const report = await generateReport(frameworkCode);
      toast.success('Compliance report generated');
      console.log('Report:', report);
    } catch (error) {
      toast.error('Failed to generate report');
    }
  };

  if (isLoading) {
    return <Card className="animate-pulse"><CardContent className="h-64" /></Card>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'default';
      case 'mostly_compliant': return 'secondary';
      case 'non_compliant': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-primary" />
              Compliance Status
            </CardTitle>
            <CardDescription>Your compliance with data protection regulations</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {frameworks && frameworks.map((framework) => {
          const userStatus = userCompliance?.find(
            (uc: any) => uc.compliance_frameworks?.framework_code === framework.framework_code
          );

          return (
            <div key={framework.id} className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{framework.framework_name}</h4>
                    {userStatus && (
                      <Badge variant={getStatusColor(userStatus.status) as any}>
                        {userStatus.status}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{framework.description}</p>
                </div>
              </div>

              {userStatus && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Compliance Score</span>
                    <span className="font-medium">{Math.round(userStatus.compliance_score)}%</span>
                  </div>
                  <Progress value={userStatus.compliance_score} className="h-2" />
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{userStatus.requirements_met?.length || 0} Requirements Met</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span>{userStatus.requirements_pending?.length || 0} Pending</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCheckCompliance(framework.framework_code)}
                >
                  Check Compliance
                </Button>
                {userStatus && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerateReport(framework.framework_code)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                )}
              </div>

              {userStatus && userStatus.requirements_pending && userStatus.requirements_pending.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                  <p className="text-sm font-medium mb-2">Pending Requirements:</p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    {userStatus.requirements_pending.slice(0, 3).map((req: string, i: number) => (
                      <li key={i}>• {req.replace(/_/g, ' ')}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
