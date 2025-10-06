import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, Image, Tag } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AnalysisResult {
  analysis_result: {
    score: number;
    summary: string;
    details: string;
  };
  tags: string[];
  confidence_score: number;
  issues_found: Array<{
    severity: 'low' | 'medium' | 'high';
    description: string;
  }>;
  recommendations: string[];
}

interface ImageAnalysisResultsProps {
  result: AnalysisResult;
  imageUrl: string;
}

export function ImageAnalysisResults({ result, imageUrl }: ImageAnalysisResultsProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-blue-600" />;
    }
  };

  const hasIssues = result.issues_found && result.issues_found.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Image Analysis Results
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Image Preview */}
        <img
          src={imageUrl}
          alt="Analyzed"
          className="w-full max-h-64 object-contain rounded-lg border"
        />

        {/* Overall Score */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Quality Score</span>
            <span className="font-bold">{result.analysis_result.score}/100</span>
          </div>
          <Progress value={result.analysis_result.score} />
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>Confidence: {Math.round(result.confidence_score * 100)}%</span>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Summary</h4>
          <p className="text-sm text-muted-foreground">
            {result.analysis_result.summary}
          </p>
        </div>

        {/* Tags */}
        {result.tags && result.tags.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {result.tags.map((tag, idx) => (
                <Badge key={idx} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Issues */}
        {hasIssues ? (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Issues Found
            </h4>
            <div className="space-y-2">
              {result.issues_found.map((issue, idx) => (
                <Alert key={idx} variant={getSeverityColor(issue.severity) as any}>
                  <div className="flex items-start gap-2">
                    {getSeverityIcon(issue.severity)}
                    <AlertDescription className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{issue.description}</span>
                        <Badge variant={getSeverityColor(issue.severity) as any}>
                          {issue.severity}
                        </Badge>
                      </div>
                    </AlertDescription>
                  </div>
                </Alert>
              ))}
            </div>
          </div>
        ) : (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>No issues found with this image</AlertDescription>
          </Alert>
        )}

        {/* Recommendations */}
        {result.recommendations && result.recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recommendations</h4>
            <ul className="space-y-1">
              {result.recommendations.map((rec, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Detailed Analysis */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Detailed Analysis</h4>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {result.analysis_result.details}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}