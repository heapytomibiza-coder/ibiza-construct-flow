/**
 * Content Diff Panel - Side-by-side comparison of questions
 */

import { ChevronDown, ChevronRight, Plus, Minus, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ContentDiff, QuestionDiff } from '@/types/compare';
import { MicroserviceDef } from '@/types/packs';
import { useState } from 'react';

interface ContentDiffPanelProps {
  contentDiff: ContentDiff | null;
  activeContent: MicroserviceDef | null | undefined;
  draftContent: MicroserviceDef | null | undefined;
}

export function ContentDiffPanel({ contentDiff, activeContent, draftContent }: ContentDiffPanelProps) {
  if (!contentDiff) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No comparison data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Content Comparison</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              Active: {contentDiff.questionsCount.active} questions
            </Badge>
            <Badge variant="outline">
              Draft: {contentDiff.questionsCount.draft} questions
            </Badge>
            {contentDiff.questionsCount.delta !== 0 && (
              <Badge variant={contentDiff.questionsCount.delta > 0 ? 'default' : 'secondary'}>
                {contentDiff.questionsCount.delta > 0 ? '+' : ''}{contentDiff.questionsCount.delta}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {contentDiff.questions.map((diff) => (
          <QuestionDiffRow key={diff.key} diff={diff} />
        ))}
      </CardContent>
    </Card>
  );
}

function QuestionDiffRow({ diff }: { diff: QuestionDiff }) {
  const [isOpen, setIsOpen] = useState(diff.status !== 'unchanged');

  const statusColors = {
    added: 'bg-green-100 dark:bg-green-900/20 border-green-300',
    removed: 'bg-red-100 dark:bg-red-900/20 border-red-300',
    changed: 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300',
    unchanged: 'bg-background border-border',
  };

  const statusIcons = {
    added: <Plus className="h-4 w-4 text-green-600" />,
    removed: <Minus className="h-4 w-4 text-red-600" />,
    changed: <Edit className="h-4 w-4 text-yellow-600" />,
    unchanged: null,
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={`border rounded-lg ${statusColors[diff.status]}`}>
        <CollapsibleTrigger className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            {statusIcons[diff.status]}
            <code className="font-mono text-sm font-semibold">{diff.key}</code>
            <Badge variant="outline" className="text-xs">
              {diff.draft?.type || diff.active?.type}
            </Badge>
            {(diff.draft?.required || diff.active?.required) && (
              <Badge variant="secondary" className="text-xs">Required</Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {diff.changes && (
              <div className="flex gap-1">
                {diff.changes.type && <Badge variant="outline" className="text-xs">Type</Badge>}
                {diff.changes.options && <Badge variant="outline" className="text-xs">Options</Badge>}
                {diff.changes.visibility && <Badge variant="outline" className="text-xs">Visibility</Badge>}
                {diff.changes.required && <Badge variant="outline" className="text-xs">Required</Badge>}
              </div>
            )}
            <Badge variant="outline" className="capitalize">{diff.status}</Badge>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="p-4 border-t space-y-4">
            {/* Question Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Active Column */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-muted-foreground">Active Pack</h4>
                {diff.active ? (
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">i18n Key:</span> <code className="text-xs">{diff.active.i18nKey}</code></div>
                    <div><span className="font-medium">Type:</span> {diff.active.type}</div>
                    {diff.active.aiHint && <div><span className="font-medium">AI Hint:</span> {diff.active.aiHint}</div>}
                    {diff.active.options && (
                      <div>
                        <span className="font-medium">Options ({diff.active.options.length}):</span>
                        <ul className="list-disc list-inside ml-2 text-xs mt-1">
                          {diff.active.options.slice(0, 3).map((opt, i) => (
                            <li key={i}>{opt.value}</li>
                          ))}
                          {diff.active.options.length > 3 && <li>+ {diff.active.options.length - 3} more...</li>}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground italic">Not present</div>
                )}
              </div>

              {/* Draft Column */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-muted-foreground">Draft Pack</h4>
                {diff.draft ? (
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">i18n Key:</span> <code className="text-xs">{diff.draft.i18nKey}</code></div>
                    <div><span className="font-medium">Type:</span> {diff.draft.type}</div>
                    {diff.draft.aiHint && <div><span className="font-medium">AI Hint:</span> {diff.draft.aiHint}</div>}
                    {diff.draft.options && (
                      <div>
                        <span className="font-medium">Options ({diff.draft.options.length}):</span>
                        <ul className="list-disc list-inside ml-2 text-xs mt-1">
                          {diff.draft.options.slice(0, 3).map((opt, i) => (
                            <li key={i}>{opt.value}</li>
                          ))}
                          {diff.draft.options.length > 3 && <li>+ {diff.draft.options.length - 3} more...</li>}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground italic">Not present</div>
                )}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
