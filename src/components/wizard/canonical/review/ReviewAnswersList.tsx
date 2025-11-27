import React from 'react';
import { Card } from '@/components/ui/card';

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
  // Group answers by category
  const groupedAnswers = answers.reduce((acc, qa) => {
    const category = qa.category || 'general';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(qa);
    return acc;
  }, {} as Record<string, QuestionAnswer[]>);

  const formatAnswer = (answer: any): string => {
    if (answer === null || answer === undefined || answer === '') {
      return '';
    }
    
    if (Array.isArray(answer)) {
      return answer.join(', ');
    }
    
    if (typeof answer === 'boolean') {
      return answer ? 'Yes' : 'No';
    }
    
    if (typeof answer === 'object') {
      return JSON.stringify(answer);
    }
    
    // Humanize snake_case values
    return String(answer)
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  const categoryTitles: Record<string, string> = {
    'project-details': '🧰 Project Details',
    'logistics': '📦 Logistics',
    'additional-details': '📎 Additional Details',
    'general': 'General Information'
  };

  return (
    <div className="space-y-4">
      {Object.entries(groupedAnswers).map(([category, items]) => (
        <Card key={category} className="overflow-hidden border-sage-muted/20">
          {/* Section Header */}
          <div 
            className="px-6 py-3 bg-sage-light/10 border-b border-sage-muted/20"
            style={{ 
              borderLeft: `4px solid ${categoryColor}` 
            }}
          >
            <h3 className="text-base font-semibold text-foreground">
              {categoryTitles[category] || category}
            </h3>
          </div>

          {/* Two-column grid for answers */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {items.map((qa) => {
                const formattedAnswer = formatAnswer(qa.answer);
                
                return (
                  <div key={qa.key} className="flex flex-col space-y-1">
                    <span className="text-sm text-muted-foreground">
                      {qa.question}
                    </span>
                    <span className="text-base font-semibold text-foreground">
                      {formattedAnswer || (
                        <span className="text-muted-foreground italic font-normal">Not answered</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
