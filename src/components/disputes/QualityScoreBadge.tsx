import React from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Award } from "lucide-react";

interface QualityScoreBadgeProps {
  score?: number;
  breakdown?: any;
  className?: string;
}

export function QualityScoreBadge({ score, breakdown, className = "" }: QualityScoreBadgeProps) {
  if (score == null) return null;

  const getColor = () => {
    if (score >= 80) return "bg-green-600 hover:bg-green-700 text-white";
    if (score >= 60) return "bg-yellow-600 hover:bg-yellow-700 text-white";
    return "bg-red-600 hover:bg-red-700 text-white";
  };

  const getLabel = () => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    return "Needs Improvement";
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={`${getColor()} cursor-help ${className}`}>
            <Award className="h-3 w-3 mr-1" />
            {getLabel()} ({score.toFixed(0)})
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <div className="font-semibold">Quality Score Breakdown</div>
            {breakdown && (
              <div className="text-xs space-y-1">
                <div>Response Timeliness: {breakdown.response_timeliness?.toFixed(1) || '—'}</div>
                <div>Dispute Frequency: {breakdown.dispute_frequency?.toFixed(1) || '—'}</div>
                <div>Cooperation: {breakdown.cooperation?.toFixed(1) || '—'}</div>
                <div>Review Reliability: {breakdown.review_reliability?.toFixed(1) || '—'}</div>
                <div>Sentiment Health: {breakdown.sentiment_health?.toFixed(1) || '—'}</div>
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-2">
              Click to view detailed breakdown
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
