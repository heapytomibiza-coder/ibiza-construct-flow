import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Bot, 
  ChevronDown, 
  ChevronRight, 
  Lightbulb, 
  AlertTriangle, 
  TrendingUp,
  CheckCircle,
  Clock,
  Target,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AIPanelProps {
  context: {
    type: 'job' | 'professional' | 'service' | 'review' | 'overview';
    id?: string;
    data?: any;
  };
  className?: string;
}

interface AIAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: any;
  created_at: string;
}

interface AISuggestion {
  id: string;
  title: string;
  description: string;
  confidence: 'high' | 'medium' | 'low';
  action?: () => void;
  type: 'validation' | 'optimization' | 'alert' | 'insight';
}

export default function AIPanel({ context, className = '' }: AIPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [alerts, setAlerts] = useState<AIAlert[]>([]);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAIInsights();
  }, [context]);

  const loadAIInsights = async () => {
    setIsLoading(true);
    try {
      // Load AI alerts - temporarily disabled until types are updated
      // const { data: alertsData } = await supabase
      //   .from('ai_alerts')
      //   .select('*')
      //   .is('resolved_at', null)
      //   .order('created_at', { ascending: false })
      //   .limit(5);

      // if (alertsData) {
      //   setAlerts(alertsData);
      // }

      // Generate contextual suggestions based on context type
      generateContextualSuggestions();
    } catch (error) {
      console.error('Error loading AI insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateContextualSuggestions = () => {
    const baseSuggestions: AISuggestion[] = [];

    switch (context.type) {
      case 'job':
        baseSuggestions.push(
          {
            id: '1',
            title: 'Route to Best Professionals',
            description: 'AI can suggest top 5 professionals based on skills, location, and performance.',
            confidence: 'high',
            type: 'optimization'
          },
          {
            id: '2',
            title: 'Price Validation',
            description: 'Check if pricing is within market range for this service type.',
            confidence: 'medium',
            type: 'validation'
          }
        );
        break;
      case 'professional':
        baseSuggestions.push(
          {
            id: '3',
            title: 'Profile Completeness Check',
            description: 'Validate profile information and suggest improvements.',
            confidence: 'high',
            type: 'validation'
          },
          {
            id: '4',
            title: 'Pricing Analysis',
            description: 'Compare rates with similar professionals in the area.',
            confidence: 'medium',
            type: 'insight'
          }
        );
        break;
      case 'service':
        baseSuggestions.push(
          {
            id: '5',
            title: 'Question Flow Validation',
            description: 'Test all question paths and identify potential issues.',
            confidence: 'high',
            type: 'validation'
          },
          {
            id: '6',
            title: 'SEO Optimization',
            description: 'Suggest improvements for search visibility.',
            confidence: 'medium',
            type: 'optimization'
          }
        );
        break;
      default:
        baseSuggestions.push(
          {
            id: '7',
            title: 'System Health Check',
            description: 'Run comprehensive platform diagnostics.',
            confidence: 'high',
            type: 'validation'
          }
        );
    }

    setSuggestions(baseSuggestions);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'medium':
        return <Clock className="h-3 w-3 text-yellow-500" />;
      case 'low':
        return <AlertTriangle className="h-3 w-3 text-orange-500" />;
      default:
        return <Target className="h-3 w-3 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'validation':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'optimization':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'alert':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'insight':
        return <Lightbulb className="h-4 w-4 text-yellow-500" />;
      default:
        return <Zap className="h-4 w-4 text-purple-500" />;
    }
  };

  if (isCollapsed) {
    return (
      <div className={`w-12 bg-background border-l border-border flex flex-col items-center py-4 ${className}`}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(false)}
          className="mb-4"
        >
          <Bot className="h-4 w-4" />
        </Button>
        {alerts.length > 0 && (
          <Badge variant="destructive" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
            {alerts.length}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className={`w-80 bg-background border-l border-border flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">AI Assistant</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(true)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Context: {context.type.charAt(0).toUpperCase() + context.type.slice(1)}
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Alerts Section */}
          {alerts.length > 0 && (
            <Collapsible defaultOpen>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="font-medium">Active Alerts</span>
                    <Badge variant="destructive" className="text-xs">
                      {alerts.length}
                    </Badge>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                {alerts.map((alert) => (
                  <Card key={alert.id} className="border-l-4 border-l-red-500">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium">{alert.type.replace('_', ' ').toUpperCase()}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {alert.details.description || 'No description available'}
                          </p>
                        </div>
                        <Badge variant={getSeverityColor(alert.severity)} className="text-xs">
                          {alert.severity}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Suggestions Section */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">AI Suggestions</span>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              {suggestions.map((suggestion) => (
                <Card key={suggestion.id} className="hover:bg-accent/50 transition-colors">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      {getTypeIcon(suggestion.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium">{suggestion.title}</p>
                          {getConfidenceIcon(suggestion.confidence)}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {suggestion.description}
                        </p>
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          Apply
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Quick Actions */}
          <Separator />
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Quick Actions
            </h4>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start" disabled={isLoading}>
                Test Workflow
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" disabled={isLoading}>
                Generate Report
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" disabled={isLoading}>
                Validate Configuration
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}