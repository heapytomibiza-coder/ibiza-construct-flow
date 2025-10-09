import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

export default function HealthMonitor() {
  const checks = [
    {
      name: 'Services with missing questions',
      status: 'warning' as const,
      count: 3,
      description: 'Some services are missing required questions',
    },
    {
      name: 'Broken taxonomy relationships',
      status: 'warning' as const,
      count: 2,
      description: 'Database relationships need attention',
    },
    {
      name: 'Stale professional profiles',
      status: 'ok' as const,
      count: 0,
      description: 'All profiles are up to date',
    },
  ];

  const getStatusIcon = (status: 'ok' | 'warning' | 'error') => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">System Health Monitor</h1>
            <p className="text-sm text-muted-foreground">
              Automated diagnostic checks and system status
            </p>
          </div>
          <Button>Run Full System Check</Button>
        </div>

        <div className="grid gap-4">
          {checks.map((check) => (
            <Card key={check.name}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(check.status)}
                    <div>
                      <CardTitle className="text-base">{check.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{check.description}</p>
                    </div>
                  </div>
                  {check.count > 0 && (
                    <Button variant="outline" size="sm">
                      Fix ({check.count})
                    </Button>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
