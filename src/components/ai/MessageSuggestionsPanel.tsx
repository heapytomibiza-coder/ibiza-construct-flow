import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Send } from 'lucide-react';

interface Suggestion {
  text: string;
  tone: 'professional' | 'friendly' | 'formal';
  reasoning: string;
}

interface MessageSuggestionsPanelProps {
  suggestions: Suggestion[];
  isLoading: boolean;
  onSelectSuggestion: (text: string) => void;
  onRefresh: () => void;
}

export function MessageSuggestionsPanel({
  suggestions,
  isLoading,
  onSelectSuggestion,
  onRefresh,
}: MessageSuggestionsPanelProps) {
  const getToneBadgeVariant = (tone: string) => {
    switch (tone) {
      case 'professional':
        return 'default';
      case 'friendly':
        return 'secondary';
      case 'formal':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 animate-pulse" />
            Generating Suggestions...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-muted rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Message Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm mb-4">
            Get AI-powered suggestions for your reply
          </p>
          <Button onClick={onRefresh} variant="outline" className="w-full">
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Suggestions
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Suggested Replies
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion, idx) => (
          <div
            key={idx}
            className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm flex-1">{suggestion.text}</p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onSelectSuggestion(suggestion.text)}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between text-xs">
              <Badge variant={getToneBadgeVariant(suggestion.tone)}>
                {suggestion.tone}
              </Badge>
              <span className="text-muted-foreground">{suggestion.reasoning}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}