import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDisputeAnalytics } from "@/hooks/useDisputeAnalytics";
import { AlertTriangle, Clock, UserX, Calendar, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const ICON_MAP = {
  slow_response: Clock,
  negative_sentiment: AlertTriangle,
  repeat_offender: UserX,
  deadline_approaching: Calendar,
};

const LEVEL_VARIANT = {
  info: "secondary",
  warning: "default",
  urgent: "destructive",
} as const;

export default function EarlyWarningPanel({ compact = false }: { compact?: boolean }) {
  const { warnings, resolveWarning, loading } = useDisputeAnalytics();

  const urgentCount = warnings.filter(w => w.level === 'urgent').length;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Early Warnings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Early Warnings</CardTitle>
          {urgentCount > 0 && (
            <p className="text-sm text-destructive mt-1">
              {urgentCount} urgent {urgentCount === 1 ? 'warning' : 'warnings'}
            </p>
          )}
        </div>
        {urgentCount > 0 && (
          <Badge variant="destructive">{urgentCount}</Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {warnings.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-600 opacity-50" />
            <p className="font-medium">No active warnings</p>
            <p className="text-sm mt-1">All disputes are progressing smoothly 🎉</p>
          </div>
        )}

        {warnings.slice(0, compact ? 5 : undefined).map(warning => {
          const Icon = ICON_MAP[warning.kind as keyof typeof ICON_MAP] || AlertTriangle;
          
          return (
            <div
              key={warning.id}
              className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <Icon className={`h-5 w-5 mt-0.5 ${
                warning.level === 'urgent' ? 'text-destructive' :
                warning.level === 'warning' ? 'text-yellow-600' :
                'text-blue-600'
              }`} />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={LEVEL_VARIANT[warning.level]} className="text-xs">
                    {warning.level}
                  </Badge>
                  <span className="text-sm font-medium capitalize">
                    {warning.kind.replace(/_/g, ' ')}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {warning.details?.reason || `${warning.kind} detected`}
                </p>
                
                <div className="flex items-center gap-2 mt-2">
                  <Link to={`/dispute/${warning.dispute_id}`}>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      View Dispute
                    </Button>
                  </Link>
                  <Button
                    onClick={() => resolveWarning(warning.id)}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                  >
                    Resolve
                  </Button>
                </div>
              </div>

              <div className="text-xs text-muted-foreground whitespace-nowrap">
                {new Date(warning.created_at).toLocaleDateString()}
              </div>
            </div>
          );
        })}

        {compact && warnings.length > 5 && (
          <Link to="/admin/warnings">
            <Button variant="outline" className="w-full" size="sm">
              View All ({warnings.length})
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
