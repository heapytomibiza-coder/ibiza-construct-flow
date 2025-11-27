import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QuestionAnswer {
  key: string;
  question: string;
  answer: any;
  type: string;
  category?: string;
}

interface ReviewAnswersListProps {
  answers: QuestionAnswer[];
  categoryColor?: string;
}

export const ReviewAnswersList: React.FC<ReviewAnswersListProps> = ({
  answers,
  categoryColor = '#D4A574'
}) => {
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(
    new Set(['project-details'])
  );

  // Group answers by category
  const groupedAnswers = React.useMemo(() => {
    const groups: Record<string, QuestionAnswer[]> = {};
    
    answers.forEach(qa => {
      const category = qa.category || 'project-details';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(qa);
    });

    return groups;
  }, [answers]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const formatAnswer = (answer: any, type: string): string => {
    if (answer === null || answer === undefined || answer === '') {
      return 'Not answered';
    }

    if (Array.isArray(answer)) {
      return answer.length > 0 ? answer.join(', ') : 'Not answered';
    }

    if (typeof answer === 'boolean') {
      return answer ? 'Yes' : 'No';
    }

    if (typeof answer === 'object') {
      return JSON.stringify(answer);
    }

    return String(answer);
  };

  const formatSectionTitle = (key: string): string => {
    return key
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const answeredCount = (sectionAnswers: QuestionAnswer[]) => {
    return sectionAnswers.filter(qa => {
      const answer = qa.answer;
      if (answer === null || answer === undefined || answer === '') return false;
      if (Array.isArray(answer)) return answer.length > 0;
      return true;
    }).length;
  };

  return (
    <div className="space-y-3 mb-6">
      {Object.entries(groupedAnswers).map(([section, sectionAnswers]) => {
        const isExpanded = expandedSections.has(section);
        const answered = answeredCount(sectionAnswers);
        const total = sectionAnswers.length;

        return (
          <Card
            key={section}
            className="border-sage-muted/20 bg-card overflow-hidden transition-all duration-200"
            style={{
              borderLeftWidth: '4px',
              borderLeftColor: categoryColor
            }}
          >
            {/* Section header */}
            <button
              onClick={() => toggleSection(section)}
              className="w-full p-5 flex items-center justify-between hover:bg-sage-light/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-foreground">
                  {formatSectionTitle(section)}
                </h3>
                <Badge variant="outline" className="text-xs">
                  {answered}/{total}
                </Badge>
              </div>

              <div className="flex items-center gap-3">
                {/* Progress bar */}
                <div className="w-24 h-2 bg-sage-light/30 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${(answered / total) * 100}%`,
                      backgroundColor: categoryColor
                    }}
                  />
                </div>

                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </button>

            {/* Section content */}
            {isExpanded && (
              <div className="px-5 pb-5 space-y-3 border-t border-sage-muted/10">
                {sectionAnswers.map((qa, idx) => {
                  const answerText = formatAnswer(qa.answer, qa.type);
                  const isAnswered = answerText !== 'Not answered';

                  return (
                    <div key={qa.key} className="py-3">
                      {/* Question */}
                      <p className="text-sm font-medium text-foreground mb-1">
                        {qa.question}
                      </p>

                      {/* Answer */}
                      <div className="flex items-start gap-2">
                        <span 
                          className="text-muted-foreground text-sm mt-0.5"
                          style={{ color: categoryColor }}
                        >
                          →
                        </span>
                        <p 
                          className={cn(
                            "text-sm font-semibold flex-1",
                            isAnswered ? "text-foreground" : "text-muted-foreground italic"
                          )}
                        >
                          {answerText}
                        </p>
                      </div>

                      {/* Divider between Q/A pairs */}
                      {idx < sectionAnswers.length - 1 && (
                        <div className="mt-3 border-b border-dotted border-sage-muted/20" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};
