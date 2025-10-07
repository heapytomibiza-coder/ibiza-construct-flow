import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSmartSuggestions } from '@/hooks/useSmartSuggestions';
import { Lightbulb, Check, X, MessageSquare } from 'lucide-react';

export const SmartSuggestionsWidget = () => {
  const { pendingSuggestions, isLoading, updateSuggestionStatus } = useSmartSuggestions();

  if (isLoading) {
    return <div>Loading suggestions...</div>;
  }

  if (!pendingSuggestions || pendingSuggestions.length === 0) {
    return null;
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'response':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="h-5 w-5 text-primary" />
        <h4 className="font-semibold">Smart Suggestions</h4>
        <Badge variant="secondary">{pendingSuggestions.length}</Badge>
      </div>

      <div className="space-y-3">
        {pendingSuggestions.slice(0, 3).map((suggestion) => (
          <div key={suggestion.id} className="border rounded-lg p-3">
            <div className="flex items-start gap-2 mb-2">
              {getTypeIcon(suggestion.suggestion_type)}
              <div className="flex-1">
                <p className="text-sm font-medium capitalize">
                  {suggestion.suggestion_type} Suggestion
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {suggestion.suggestion_text}
                </p>
                {suggestion.confidence_score && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Confidence: {Math.round(suggestion.confidence_score * 100)}%
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => updateSuggestionStatus({ id: suggestion.id, status: 'accepted' })}
              >
                <Check className="h-3 w-3 mr-1" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => updateSuggestionStatus({ id: suggestion.id, status: 'dismissed' })}
              >
                <X className="h-3 w-3 mr-1" />
                Dismiss
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};