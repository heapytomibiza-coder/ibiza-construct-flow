import React from 'react';
import { Card } from '@/components/ui/card';
import { format, parseISO, isValid } from 'date-fns';

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
  // Remove duplicates by key
  const uniqueAnswers = React.useMemo(() => {
    const seen = new Set<string>();
    return answers.filter(qa => {
      if (seen.has(qa.key)) {
        return false;
      }
      seen.add(qa.key);
      return true;
    });
  }, [answers]);

  // Group answers by category
  const groupedAnswers = uniqueAnswers.reduce((acc, qa) => {
    const category = qa.category || 'general';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(qa);
    return acc;
  }, {} as Record<string, QuestionAnswer[]>);

  const formatDate = (dateString: string): string => {
    try {
      const date = parseISO(dateString);
      if (isValid(date)) {
        return format(date, 'MMMM d, yyyy');
      }
    } catch (error) {
      console.warn('Failed to parse date:', dateString, error);
    }
    return dateString;
  };

  // Check if string is a base64 image
  const isBase64Image = (str: string): boolean => {
    if (typeof str !== 'string') return false;
    return str.startsWith('data:image/');
  };

  // Check if array contains base64 images
  const isImageArray = (arr: any[]): boolean => {
    return arr.length > 0 && arr.every(item => typeof item === 'string' && isBase64Image(item));
  };

  const formatAnswer = (answer: any, key?: string): string | React.ReactNode => {
    if (answer === null || answer === undefined || answer === '') {
      return '';
    }
    
    // Handle photo arrays - render as images
    if (Array.isArray(answer) && isImageArray(answer)) {
      return 'photos'; // Signal to render as images
    }
    
    if (Array.isArray(answer)) {
      return answer.join(', ');
    }
    
    if (typeof answer === 'boolean') {
      return answer ? 'Yes' : 'No';
    }
    
    // Handle single base64 image
    if (typeof answer === 'string' && isBase64Image(answer)) {
      return 'photo'; // Signal to render as image
    }
    
    // Handle Date objects BEFORE general object check
    if (answer instanceof Date) {
      if (isValid(answer)) {
        return format(answer, 'MMMM d, yyyy');
      }
      return String(answer);
    }
    
    // Handle other objects (but not Dates)
    if (typeof answer === 'object') {
      // Try to detect if it's a date-like object
      if (answer.toISOString) {
        try {
          return format(new Date(answer), 'MMMM d, yyyy');
        } catch {
          return JSON.stringify(answer);
        }
      }
      return JSON.stringify(answer);
    }
    
    let answerStr = String(answer);
    
    // Remove surrounding quotes if present (e.g., "2025-12-16T23:00:00.000Z")
    if (answerStr.startsWith('"') && answerStr.endsWith('"')) {
      answerStr = answerStr.slice(1, -1);
    }
    
    // Check if it's an ISO date string (handles full ISO 8601 format with timezone)
    if (answerStr.match(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/)) {
      return formatDate(answerStr);
    }
    
    // Humanize snake_case values
    return answerStr
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  };
  
  // Render photos as image thumbnails
  const renderPhotos = (photos: string[]) => {
    return (
      <div className="flex gap-2 flex-wrap">
        {photos.map((photo, idx) => (
          <img
            key={idx}
            src={photo}
            alt={`Photo ${idx + 1}`}
            className="w-16 h-16 object-cover rounded-lg border border-border"
          />
        ))}
      </div>
    );
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
                const formattedAnswer = formatAnswer(qa.answer, qa.key);
                const isPhotoField = qa.key.toLowerCase() === 'photos' || qa.key.toLowerCase() === 'photo';
                const hasPhotos = Array.isArray(qa.answer) && qa.answer.length > 0 && isBase64Image(qa.answer[0]);
                
                return (
                  <div key={qa.key} className="flex flex-col space-y-1">
                    <span className="text-sm text-muted-foreground">
                      {qa.question}
                    </span>
                    {hasPhotos ? (
                      renderPhotos(qa.answer)
                    ) : (
                      <span className="text-base font-semibold text-foreground">
                        {formattedAnswer || (
                          <span className="text-muted-foreground italic font-normal">Not answered</span>
                        )}
                      </span>
                    )}
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
