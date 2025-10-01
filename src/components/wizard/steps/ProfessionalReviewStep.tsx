/**
 * Step 4: Professional Review
 * AI-generated professional job card with all details
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Sparkles, MapPin, Calendar, Clock, 
  FileText, Loader2, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface WizardState {
  selectedCategory: string;
  selectedSubcategory: string;
  selectedMicro: string;
  selectedMicroId: string;
  jobTitle: string;
  aiAnswers: Record<string, any>;
  location: string;
  coordinates?: { lat: number; lng: number };
  preferredDate?: string;
  urgency: 'flexible' | 'within_week' | 'urgent' | 'asap';
  professionalDescription?: string;
}

interface ProfessionalReviewStepProps {
  wizardState: WizardState;
  onDescriptionGenerated: (description: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  loading: boolean;
}

const urgencyLabels = {
  flexible: 'Flexible',
  within_week: 'Within a Week',
  urgent: 'Urgent (2-3 days)',
  asap: 'ASAP (Today)'
};

const urgencyColors = {
  flexible: 'bg-blue-500/10 text-blue-500',
  within_week: 'bg-green-500/10 text-green-500',
  urgent: 'bg-orange-500/10 text-orange-500',
  asap: 'bg-red-500/10 text-red-500'
};

const ProfessionalReviewStep: React.FC<ProfessionalReviewStepProps> = ({
  wizardState,
  onDescriptionGenerated,
  onSubmit,
  onBack,
  loading
}) => {
  const { t } = useTranslation();
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [aiDescription, setAiDescription] = useState('');

  useEffect(() => {
    generateProfessionalDescription();
  }, []);

  const generateProfessionalDescription = async () => {
    setGeneratingDescription(true);
    try {
      // Call AI to generate professional description
      const { data, error } = await supabase.functions.invoke('ai-chatbot', {
        body: {
          messages: [
            {
              role: 'system',
              content: 'You are a professional job description writer. Create clear, professional job descriptions that help service providers understand exactly what needs to be done. Be concise but thorough.'
            },
            {
              role: 'user',
              content: `Create a professional job description for this job posting:

Service: ${wizardState.selectedMicro}
Category: ${wizardState.selectedCategory} > ${wizardState.selectedSubcategory}
Job Title: ${wizardState.jobTitle}
Location: ${wizardState.location}
Urgency: ${urgencyLabels[wizardState.urgency]}
${wizardState.preferredDate ? `Preferred Date: ${format(new Date(wizardState.preferredDate), 'PPP')}` : ''}

User Answers:
${Object.entries(wizardState.aiAnswers).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

Write a professional, easy-to-read description that includes:
1. Overview of what needs to be done
2. Key requirements based on the answers
3. Location and timing details
4. Any special considerations

Keep it under 250 words, use bullet points where appropriate, and make it scan-friendly for busy professionals.`
            }
          ]
        }
      });

      if (error) {
        console.error('AI generation error:', error);
        throw error;
      }

      const description = data?.response || generateFallbackDescription();
      setAiDescription(description);
      onDescriptionGenerated(description);
    } catch (error) {
      console.error('Error generating description:', error);
      const fallback = generateFallbackDescription();
      setAiDescription(fallback);
      onDescriptionGenerated(fallback);
    } finally {
      setGeneratingDescription(false);
    }
  };

  const generateFallbackDescription = () => {
    const answers = Object.entries(wizardState.aiAnswers)
      .map(([key, value]) => `• ${key.replace(/_/g, ' ')}: ${Array.isArray(value) ? value.join(', ') : value}`)
      .join('\n');

    return `**${wizardState.selectedMicro} Service Needed**

I'm looking for a professional to help with ${wizardState.selectedMicro.toLowerCase()} at ${wizardState.location}.

**Timeline:** ${urgencyLabels[wizardState.urgency]}
${wizardState.preferredDate ? `**Preferred Date:** ${format(new Date(wizardState.preferredDate), 'PPP')}` : ''}

**Requirements:**
${answers || 'Please contact me for more details about the requirements.'}

**Location:** ${wizardState.location}

I'm looking forward to receiving offers from qualified professionals. Please reach out if you have experience with this type of work!`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
          <Sparkles className="w-5 h-5" />
          <span className="font-medium">AI-Enhanced Review</span>
        </div>
        <h1 className="text-4xl font-bold">Review Your Job Post</h1>
        <p className="text-muted-foreground text-lg">
          Here's how your job will appear to professionals
        </p>
      </div>

      {/* Professional Job Card Preview */}
      <Card className="overflow-hidden border-2">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <h2 className="text-3xl font-bold">{wizardState.jobTitle}</h2>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Badge variant="secondary" className="text-sm">
                    {wizardState.selectedCategory}
                  </Badge>
                  <span>•</span>
                  <span>{wizardState.selectedSubcategory}</span>
                  <span>•</span>
                  <span className="font-medium">{wizardState.selectedMicro}</span>
                </div>
              </div>
              <Badge 
                variant="outline" 
                className={cn("text-sm px-3 py-1", urgencyColors[wizardState.urgency])}
              >
                {urgencyLabels[wizardState.urgency]}
              </Badge>
            </div>

            {/* Quick Info */}
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{wizardState.location}</span>
              </div>
              {wizardState.preferredDate && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    {format(new Date(wizardState.preferredDate), 'MMM d, yyyy')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Description Section */}
        <div className="p-8 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-semibold">Job Description</h3>
            </div>

            {generatingDescription ? (
              <Card className="p-8 bg-muted/50">
                <div className="flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">AI is crafting your professional description...</p>
                </div>
              </Card>
            ) : (
              <div className="prose prose-sm max-w-none">
                <div className="bg-muted/50 rounded-lg p-6 whitespace-pre-wrap">
                  {aiDescription}
                </div>
              </div>
            )}
          </div>

          {/* Requirements Answered */}
          {Object.keys(wizardState.aiAnswers).length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Questions Answered
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(wizardState.aiAnswers).map(([key, value]) => (
                    <Card key={key} className="p-4 bg-muted/30">
                      <div className="text-sm font-medium text-muted-foreground mb-1">
                        {key.replace(/_/g, ' ')}
                      </div>
                      <div className="text-sm">
                        {Array.isArray(value) ? value.join(', ') : String(value)}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* What Happens Next */}
        <div className="bg-primary/5 p-8 border-t">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary" />
            What Happens Next?
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Your job will be posted and visible to qualified professionals</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span>You'll receive offers from interested professionals</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Review their profiles, ratings, and pricing</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Choose your preferred professional and get started!</span>
            </li>
          </ul>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6">
        <Button variant="outline" onClick={onBack} size="lg" disabled={loading}>
          ← Edit Details
        </Button>
        <Button 
          onClick={onSubmit} 
          disabled={loading || generatingDescription}
          size="lg"
          className="min-w-[200px]"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Posting...
            </>
          ) : (
            <>Post My Job</>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ProfessionalReviewStep;
