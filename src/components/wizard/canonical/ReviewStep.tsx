import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { 
  ReviewHeroSection, 
  ReviewSummaryCards, 
  ReviewAnswersList, 
  ReviewCTASection,
  createSummaryCards,
  QuestionAnswer
} from './review';

interface ReviewStepProps {
  jobData: {
    microName?: string;
    category?: string;
    subcategory?: string;
    answers?: Record<string, any>;
    questionsWithAnswers?: QuestionAnswer[];
    logistics?: Record<string, any>;
    extras?: Record<string, any>;
  };
  onBack: () => void;
  onSubmit: () => void;
  loading?: boolean;
  onEditSection?: (sectionId: string) => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ 
  jobData, 
  onBack, 
  onSubmit,
  loading = false,
  onEditSection
}) => {
  // Category color mapping
  const categoryColors: Record<string, string> = {
    construction: '#D4A574',
    carpentry: '#8B6914',
    garden: '#4A7C59',
    electrical: '#3B82F6',
    plumbing: '#0EA5E9',
    default: '#D4A574'
  };

  const categoryColor = categoryColors[jobData.category?.toLowerCase() || 'default'] || categoryColors.default;

  // Extract data for summary cards
  const location = jobData.logistics?.location || jobData.logistics?.job_location;
  const budget = jobData.logistics?.budget_range || jobData.logistics?.budget;
  const timeline = jobData.logistics?.preferred_date || jobData.logistics?.timeline;
  const description = jobData.logistics?.description;

  const summaryCards = createSummaryCards({
    location,
    budget,
    timeline,
    description
  });

  // Helper to humanize keys
  const humanizeKey = (key: string): string => {
    return key
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  // Use enhanced questionsWithAnswers if available, otherwise fallback to old format
  const questionsWithAnswers: QuestionAnswer[] = jobData.questionsWithAnswers || 
    Object.entries(jobData.answers || {}).map(([key, answer]) => ({
      key,
      question: humanizeKey(key),
      answer,
      type: 'text',
      category: 'project-details'
    }));

  // Add logistics answers
  if (jobData.logistics) {
    Object.entries(jobData.logistics).forEach(([key, value]) => {
      questionsWithAnswers.push({
        key,
        question: humanizeKey(key),
        answer: value,
        type: 'text',
        category: 'logistics'
      });
    });
  }

  // Add extras if any
  if (jobData.extras) {
    Object.entries(jobData.extras).forEach(([key, value]) => {
      questionsWithAnswers.push({
        key,
        question: humanizeKey(key),
        answer: value,
        type: 'text',
        category: 'additional-details'
      });
    });
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 pb-6 space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="gap-2 -ml-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      {/* Hero Section */}
      <ReviewHeroSection
        serviceName={jobData.microName || 'Your Service'}
        category={jobData.category}
        subcategory={jobData.subcategory}
        location={location}
        budget={budget}
        timeline={timeline}
        categoryColor={categoryColor}
      />

      {/* Summary Cards */}
      {summaryCards.length > 0 && (
        <ReviewSummaryCards
          cards={summaryCards}
          onEdit={onEditSection}
          categoryColor={categoryColor}
        />
      )}

      {/* Detailed Q&A List */}
      <ReviewAnswersList
        answers={questionsWithAnswers}
        categoryColor={categoryColor}
      />

      {/* CTA Section */}
      <ReviewCTASection
        onSubmit={onSubmit}
        loading={loading}
        categoryColor={categoryColor}
      />
    </div>
  );
};
