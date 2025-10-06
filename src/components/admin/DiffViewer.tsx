import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Plus, Minus, AlertCircle } from "lucide-react";

interface DiffViewerProps {
  before: Record<string, any>;
  after: Record<string, any>;
  highlightFields?: string[];
}

export function DiffViewer({ before, after, highlightFields }: DiffViewerProps) {
  const getChanges = () => {
    const changes: Array<{
      field: string;
      oldValue: any;
      newValue: any;
      type: 'modified' | 'added' | 'removed';
    }> = [];

    const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

    allKeys.forEach(key => {
      // Skip internal fields
      if (key === 'id' || key === 'created_at' || key === 'updated_at') return;

      const oldValue = before[key];
      const newValue = after[key];

      if (oldValue === undefined && newValue !== undefined) {
        changes.push({ field: key, oldValue, newValue, type: 'added' });
      } else if (oldValue !== undefined && newValue === undefined) {
        changes.push({ field: key, oldValue, newValue, type: 'removed' });
      } else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({ field: key, oldValue, newValue, type: 'modified' });
      }
    });

    return changes;
  };

  const changes = getChanges();

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'added': return 'text-green-500';
      case 'removed': return 'text-red-500';
      case 'modified': return 'text-blue-500';
      default: return 'text-muted-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'added': return <Plus className="h-4 w-4" />;
      case 'removed': return <Minus className="h-4 w-4" />;
      case 'modified': return <ArrowRight className="h-4 w-4" />;
      default: return null;
    }
  };

  if (changes.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No changes detected</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="outline">{changes.length} change{changes.length !== 1 ? 's' : ''}</Badge>
        <Badge variant="secondary" className="gap-1">
          <Plus className="h-3 w-3" />
          {changes.filter(c => c.type === 'added').length}
        </Badge>
        <Badge variant="secondary" className="gap-1">
          <Minus className="h-3 w-3" />
          {changes.filter(c => c.type === 'removed').length}
        </Badge>
        <Badge variant="secondary" className="gap-1">
          <ArrowRight className="h-3 w-3" />
          {changes.filter(c => c.type === 'modified').length}
        </Badge>
      </div>

      {changes.map((change, index) => {
        const isHighlighted = highlightFields?.includes(change.field);
        
        return (
          <Card 
            key={index} 
            className={isHighlighted ? 'border-primary' : ''}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={getTypeColor(change.type)}>
                  {getTypeIcon(change.type)}
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="font-medium capitalize">
                      {change.field.replace(/_/g, ' ')}
                    </p>
                    <Badge variant={
                      change.type === 'added' ? 'default' :
                      change.type === 'removed' ? 'destructive' : 'secondary'
                    }>
                      {change.type}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {change.type !== 'added' && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Before:</p>
                        <div className="p-2 bg-red-50 dark:bg-red-950/20 rounded text-sm font-mono whitespace-pre-wrap break-all">
                          {formatValue(change.oldValue)}
                        </div>
                      </div>
                    )}
                    
                    {change.type !== 'removed' && (
                      <div className={change.type === 'added' ? 'col-span-2' : ''}>
                        <p className="text-xs text-muted-foreground mb-1">After:</p>
                        <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded text-sm font-mono whitespace-pre-wrap break-all">
                          {formatValue(change.newValue)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
