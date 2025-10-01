/**
 * Step 4: Professional Review
 * Premium AI-enhanced job card preview with semantic design tokens
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, MapPin, Calendar, FileText, Loader2, 
  CheckCircle2, Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ProfessionalMatcher } from '../ProfessionalMatcher';

interface WizardState {
  selectedCategory: string;
  selectedSubcategory: string;
  selectedMicro: string;
  selectedMicroId: string;
  categoryName: string;
  microName: string;
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
  flexible: { label: 'Flexible', className: 'border-primary/30 text-primary' },
  within_week: { label: 'Within a Week', className: 'border-accent/30 text-accent' },
  urgent: { label: 'Urgent', className: 'border-accent text-accent' },
  asap: { label: 'ASAP', className: 'border-destructive/30 text-destructive' }
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
      const { data, error } = await supabase.functions.invoke('ai-chatbot', {
        body: {
          messages: [
            {
              role: 'system',
              content: 'You are a professional job description writer. Create clear, professional job descriptions that help service providers understand exactly what needs to be done.'
            },
            {
              role: 'user',
              content: `Create a professional job description:

Service: ${wizardState.microName}
Category: ${wizardState.categoryName}
Title: ${wizardState.jobTitle}
Location: ${wizardState.location}
Urgency: ${urgencyLabels[wizardState.urgency].label}

User Requirements:
${Object.entries(wizardState.aiAnswers).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

Write a clear, scan-friendly description (under 200 words).`
            }
          ]
        }
      });

      if (error) throw error;
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

    return `**${wizardState.microName} Service**

Professional ${wizardState.microName.toLowerCase()} needed at ${wizardState.location}.

**Timeline:** ${urgencyLabels[wizardState.urgency].label}
${wizardState.preferredDate ? `**Date:** ${format(new Date(wizardState.preferredDate), 'PPP')}` : ''}

**Requirements:**
${answers || 'Contact for details.'}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-4">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">AI-Enhanced Preview</span>
        </div>
        <h1 className="text-4xl font-bold">Review Your Job Post</h1>
        <p className="text-muted-foreground text-lg">
          This is how qualified professionals will see your request
        </p>
      </div>

      {/* Premium Professional Job Card */}
      <Card className="overflow-hidden border-2 shadow-luxury hover:shadow-elegant transition-all duration-300">
        {/* Hero Section with Gradient */}
        <div className="bg-gradient-to-r from-primary via-charcoal-light to-primary p-8 text-primary-foreground">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge className="bg-accent text-accent-foreground px-3 py-1 text-sm font-semibold">
                  {wizardState.categoryName}
                </Badge>
                {urgencyLabels[wizardState.urgency] && (
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "border-2 bg-background/10 backdrop-blur-sm px-3 py-1",
                      urgencyLabels[wizardState.urgency].className
                    )}
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    {urgencyLabels[wizardState.urgency].label}
                  </Badge>
                )}
              </div>
              <h2 className="text-3xl font-bold leading-tight">
                {wizardState.jobTitle || 'Professional Service Request'}
              </h2>
              <div className="flex items-center gap-4 text-sm opacity-90">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{wizardState.location || 'Location TBD'}</span>
                </div>
                {wizardState.preferredDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(wizardState.preferredDate), 'MMM d, yyyy')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 space-y-8">
          {/* AI-Generated Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Project Description</h3>
                <p className="text-sm text-muted-foreground">AI-enhanced for clarity</p>
              </div>
            </div>
            {generatingDescription ? (
              <div className="flex items-center gap-3 p-6 bg-muted/30 rounded-xl">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-muted-foreground">Crafting professional description...</span>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap bg-muted/20 p-6 rounded-xl border border-border">
                  {aiDescription}
                </p>
              </div>
            )}
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border-2 border-primary/10 bg-primary/5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Location</p>
                  <p className="text-base font-semibold text-foreground truncate">
                    {wizardState.location || 'Not specified'}
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 border-2 border-accent/10 bg-accent/5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Timeline</p>
                  <p className="text-base font-semibold text-foreground">
                    {wizardState.preferredDate 
                      ? format(new Date(wizardState.preferredDate), 'MMM d, yyyy')
                      : urgencyLabels[wizardState.urgency]?.label || 'Flexible'}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-2 border-accent/10 bg-accent/5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Service Type</p>
                  <p className="text-base font-semibold text-foreground truncate">
                    {wizardState.microName}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Project Requirements */}
          {Object.keys(wizardState.aiAnswers).length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Project Requirements</h3>
                  <p className="text-sm text-muted-foreground">Key details for professionals</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(wizardState.aiAnswers).map(([key, value]) => (
                  <Card 
                    key={key} 
                    className="p-5 bg-muted/20 border-2 hover:border-primary/20 transition-colors"
                  >
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        {key.replace(/_/g, ' ')}
                      </p>
                      <p className="text-base text-foreground font-medium">
                        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CTA Footer */}
        <div className="px-8 pb-8">
          <div className="bg-gradient-to-r from-accent/10 via-accent/5 to-accent/10 p-6 rounded-xl border-2 border-accent/20">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-accent">Ready to Connect</p>
                <p className="text-sm text-muted-foreground">Post this job to qualified professionals</p>
              </div>
              <Badge className="bg-accent text-accent-foreground px-4 py-2">
                Free to Post
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Professional Matcher Preview */}
      <ProfessionalMatcher
        microId={wizardState.selectedMicroId}
        location={wizardState.location}
      />

      {/* What Happens Next */}
      <Card className="overflow-hidden border-2">
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">What Happens Next?</h3>
              <p className="text-sm text-muted-foreground">Your journey to completion</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4 items-start group">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
                1
              </div>
              <div className="flex-1 pt-2">
                <p className="text-base font-semibold mb-1">Instant Professional Matching</p>
                <p className="text-sm text-muted-foreground">
                  Your job is immediately visible to verified professionals in your area with matching expertise
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start group">
              <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
                2
              </div>
              <div className="flex-1 pt-2">
                <p className="text-base font-semibold mb-1">Receive Competitive Offers</p>
                <p className="text-sm text-muted-foreground">
                  Qualified professionals review your request and submit detailed offers with pricing and timelines
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start group">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
                3
              </div>
              <div className="flex-1 pt-2">
                <p className="text-base font-semibold mb-1">Compare & Choose</p>
                <p className="text-sm text-muted-foreground">
                  Review profiles, ratings, and offers in your dashboard to select the perfect professional
                </p>
              </div>
            </div>
          </div>
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
            <>Post My Job →</>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ProfessionalReviewStep;
