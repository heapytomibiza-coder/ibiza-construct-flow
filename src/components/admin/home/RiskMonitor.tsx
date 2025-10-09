import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';

type RiskSeverity = 'high' | 'medium' | 'low';

export function RiskMonitor() {
  // Simplified implementation - will add real queries later
  const risks = [
    {
      label: 'SLA Breaches',
      count: 0,
      severity: 'high' as RiskSeverity,
      link: '/admin/helpdesk',
    },
    {
      label: 'Active Disputes',
      count: 0,
      severity: 'medium' as RiskSeverity,
      link: '/admin/disputes',
    },
    {
      label: 'Flagged Reviews',
      count: 0,
      severity: 'low' as RiskSeverity,
      link: '/admin/reviews',
    },
  ];

  const getSeverityColor = (severity: RiskSeverity): string => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Risk Monitor</CardTitle>
        <p className="text-sm text-muted-foreground">Items requiring immediate attention</p>
        <Separator className="my-2" />
      </CardHeader>
      <CardContent className="space-y-3">
        {risks.map((risk) => (
          <div key={risk.label} className="flex items-center justify-between">
            <span className="text-sm">{risk.label}</span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={getSeverityColor(risk.severity)}>
                {risk.severity}
              </Badge>
              <Button variant="outline" size="sm" asChild>
                <Link to={risk.link}>View ({risk.count})</Link>
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
