import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertCircle } from 'lucide-react';

export function SystemHealthPanel() {
  const healthChecks = [
    { label: 'Database Status', status: 'OK', isHealthy: true },
    { label: 'Edge Functions', status: 'OK', isHealthy: true },
    { label: 'Storage Usage', status: '76%', isHealthy: true },
    { label: 'RLS Policies', status: 'OK', isHealthy: true },
  ];

  const quickActions = [
    { label: 'Generate Report', action: () => {} },
    { label: 'Validate Configuration', action: () => {} },
    { label: 'View Audit Log', action: () => {} },
    { label: 'Refresh Cache', action: () => {} },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">System Health</CardTitle>
          <p className="text-sm text-muted-foreground">Latest platform diagnostics</p>
          <Separator className="my-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {healthChecks.map((check) => (
            <div key={check.label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {check.isHealthy ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                )}
                <span>{check.label}</span>
              </div>
              <span className={check.isHealthy ? 'text-green-600' : 'text-yellow-600'}>
                {check.status}
              </span>
            </div>
          ))}
          <Button className="w-full mt-4">Run Full System Check</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <p className="text-sm text-muted-foreground">Common admin shortcuts</p>
          <Separator className="my-2" />
        </CardHeader>
        <CardContent className="space-y-2">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="w-full justify-start"
              onClick={action.action}
            >
              {action.label}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
