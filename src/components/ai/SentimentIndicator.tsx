import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Smile, Frown, Meh, TrendingUp } from 'lucide-react';

interface SentimentIndicatorProps {
  sentiment: {
    sentiment_score: number;
    sentiment_label: 'positive' | 'negative' | 'neutral';
    emotions?: {
      joy?: number;
      anger?: number;
      sadness?: number;
      fear?: number;
      surprise?: number;
      trust?: number;
    };
    key_phrases?: string[];
  };
  compact?: boolean;
}

export function SentimentIndicator({ sentiment, compact = false }: SentimentIndicatorProps) {
  const getSentimentIcon = () => {
    switch (sentiment.sentiment_label) {
      case 'positive':
        return <Smile className="h-4 w-4 text-green-600" />;
      case 'negative':
        return <Frown className="h-4 w-4 text-red-600" />;
      default:
        return <Meh className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getSentimentColor = () => {
    switch (sentiment.sentiment_label) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  const normalizedScore = ((sentiment.sentiment_score + 1) / 2) * 100;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {getSentimentIcon()}
        <Badge variant="outline" className={getSentimentColor()}>
          {sentiment.sentiment_label}
        </Badge>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Sentiment Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getSentimentIcon()}
            <span className="font-medium capitalize">{sentiment.sentiment_label}</span>
          </div>
          <span className={`font-bold ${getSentimentColor()}`}>
            {Math.round(normalizedScore)}%
          </span>
        </div>

        <Progress value={normalizedScore} className="h-2" />

        {sentiment.emotions && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Emotional Breakdown</h4>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(sentiment.emotions).map(([emotion, value]) => (
                <div key={emotion} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize text-muted-foreground">{emotion}</span>
                    <span className="font-medium">{Math.round((value || 0) * 100)}%</span>
                  </div>
                  <Progress value={(value || 0) * 100} className="h-1" />
                </div>
              ))}
            </div>
          </div>
        )}

        {sentiment.key_phrases && sentiment.key_phrases.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Key Phrases</h4>
            <div className="flex flex-wrap gap-2">
              {sentiment.key_phrases.map((phrase, idx) => (
                <Badge key={idx} variant="secondary">
                  {phrase}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}