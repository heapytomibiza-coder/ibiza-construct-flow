/**
 * Health Check Panel - Quality assurance badges and checks
 */

import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PackHealthCheck } from '@/types/compare';

interface HealthCheckPanelProps {
  title: string;
  health: PackHealthCheck | null;
}

export function HealthCheckPanel({ title, health }: HealthCheckPanelProps) {
  if (!health) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No health data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Schema Validation */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Schema Valid</span>
          {health.schemaValid ? (
            <Badge variant="outline" className="gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-600" />
              Pass
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1">
              <XCircle className="h-3 w-3" />
              Fail
            </Badge>
          )}
        </div>

        {health.schemaErrors && health.schemaErrors.length > 0 && (
          <div className="text-xs text-destructive">
            <ul className="list-disc list-inside">
              {health.schemaErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* i18n Coverage */}
        <div className="space-y-2">
          <span className="text-sm font-medium">i18n Coverage</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              EN: {Math.round(health.i18nCoverage.en * 100)}%
            </Badge>
            <Badge variant="outline">
              ES: {Math.round(health.i18nCoverage.es * 100)}%
            </Badge>
          </div>
          {health.i18nCoverage.missingKeys.length > 0 && (
            <div className="text-xs text-yellow-600">
              {health.i18nCoverage.missingKeys.length} missing keys
            </div>
          )}
        </div>

        {/* Pattern Compliance */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Pattern Compliance</span>
            {health.patternCompliance.valid ? (
              <Badge variant="outline" className="gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                Valid
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1">
                <AlertTriangle className="h-3 w-3 text-yellow-600" />
                Review
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {health.patternCompliance.mappedSlots.length} / {health.patternCompliance.expectedSlots.length} slots mapped
          </div>
        </div>

        {/* Forbidden Topics */}
        <div className="space-y-2">
          <span className="text-sm font-medium">Forbidden Topics</span>
          {health.forbiddenTopics.violations.length === 0 ? (
            <Badge variant="outline" className="gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-600" />
              None
            </Badge>
          ) : (
            <div className="space-y-1">
              {health.forbiddenTopics.violations.map((v, i) => (
                <Badge key={i} variant="destructive" className="text-xs">
                  {v}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
