/**
 * Step 7: Review (Inline Edit with Accordion)
 * Professional job card preview
 */
import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowLeft, Edit2, MapPin, Calendar, Euro, FileText, Image } from 'lucide-react';
import { format } from 'date-fns';
import { EditableReviewChips } from '@/components/wizard/EditableReviewChips';
import constructionServicesData from '@/data/construction-services.json';
import { renderPromptTemplate } from '@/lib/generators/promptRenderer';
import { mapMicroIdToServiceId } from '@/lib/mappers/serviceIdMapper';

// Utility to convert snake_case/kebab-case to human-readable text
const humanizeKey = (key: string): string => {
  return key
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
};

interface ReviewStepProps {
  jobData: {
    microName: string;
    category: string;
    subcategory: string;
    answers: Record<string, any>;
    logistics: any;
    extras: any;
  };
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  jobData,
  onBack,
  onSubmit,
  loading
}) => {
  const { microName, category, subcategory, answers, logistics, extras } = jobData;

  // Generate job description from prompt template
  const jobDescription = useMemo(() => {
    const serviceId = mapMicroIdToServiceId(microName);
    const service = constructionServicesData.services.find(s => s.id === serviceId);
    
    if (!service || !service.promptTemplate) {
      return null;
    }

    return renderPromptTemplate(service.promptTemplate, answers);
  }, [microName, answers]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack} className="mb-4" disabled={loading}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Edit
        </Button>

        <div>
          <Badge variant="outline" className="mb-4">Review & Submit</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-charcoal">
            {microName}
          </h1>
          <div className="flex items-center gap-2 mt-2 text-muted-foreground">
            <span>{category}</span>
            <span>•</span>
            <span>{subcategory}</span>
            {logistics.location && (
              <>
                <span>•</span>
                <MapPin className="w-4 h-4" />
                <span>{logistics.location}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Job Card Preview */}
      <Card className="p-8 space-y-6">
        {/* Editable Summary Chips */}
        <div>
          <h2 className="text-xl font-semibold text-charcoal mb-4">Project Summary</h2>
          <EditableReviewChips
            chips={[
              { id: 'location', label: 'Location', value: logistics.location || 'Not set', editable: true, type: 'text' },
              { id: 'budget', label: 'Budget', value: logistics.budgetRange || 'Not set', editable: true, type: 'text' },
              ...Object.entries(answers).slice(0, 3).map(([key, value]) => ({
                id: key,
                label: humanizeKey(key),
                value: Array.isArray(value) 
                  ? value.map(v => humanizeKey(String(v))).join(', ')
                  : humanizeKey(String(value)),
                editable: true,
                type: 'text' as const
              }))
            ]}
            onChipEdit={(chipId, newValue) => {
              console.log('Edit requested:', chipId, newValue);
              // In a real implementation, this would update the wizard state
            }}
          />
        </div>

        {/* Generated Job Description */}
        {jobDescription && (
          <div className="p-4 bg-muted/50 rounded-lg border">
            <h3 className="text-sm font-semibold text-charcoal mb-2">Generated Job Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {jobDescription}
            </p>
          </div>
        )}

        {/* Editable Sections */}
        <Accordion type="multiple" className="space-y-3">
          {/* Scope & Specs */}
          <AccordionItem value="scope" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-copper" />
                <span className="font-semibold">Scope & Specifications</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-2">
              {Object.entries(answers).map(([key, value]) => (
                <div key={key} className="flex justify-between py-2 border-b last:border-0">
                  <span className="text-sm font-medium text-charcoal capitalize">
                    {humanizeKey(key)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {Array.isArray(value) 
                      ? value.map(v => humanizeKey(String(v))).join(', ')
                      : humanizeKey(String(value))}
                  </span>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>

          {/* Site & Logistics */}
          <AccordionItem value="logistics" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-copper" />
                <span className="font-semibold">Site & Logistics</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-2">
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm font-medium">Location</span>
                <span className="text-sm text-muted-foreground">{logistics.location}</span>
              </div>
              {logistics.accessDetails && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm font-medium">Access</span>
                  <span className="text-sm text-muted-foreground">{logistics.accessDetails}</span>
                </div>
              )}
              {logistics.contactName && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm font-medium">Contact</span>
                  <span className="text-sm text-muted-foreground">
                    {logistics.contactName} {logistics.contactPhone}
                  </span>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Schedule */}
          <AccordionItem value="schedule" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-copper" />
                <span className="font-semibold">Schedule</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-2">
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm font-medium">Preferred Date</span>
                <span className="text-sm text-muted-foreground">
                  {logistics.preferredDate 
                    ? format(logistics.preferredDate, 'PPP')
                    : logistics.datePreset || 'Flexible'}
                </span>
              </div>
              {logistics.timeWindow && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm font-medium">Time Window</span>
                  <span className="text-sm text-muted-foreground">{logistics.timeWindow}</span>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Budget */}
          <AccordionItem value="budget" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Euro className="w-5 h-5 text-copper" />
                <span className="font-semibold">Budget</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="flex justify-between py-2">
                <span className="text-sm font-medium">Budget Range</span>
                <span className="text-sm text-muted-foreground">{logistics.budgetRange}</span>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Photos & Notes */}
          {(extras.photos.length > 0 || extras.notes) && (
            <AccordionItem value="extras" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Image className="w-5 h-5 text-copper" />
                  <span className="font-semibold">Photos & Notes</span>
                  <Badge variant="outline">{extras.photos.length} photos</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 space-y-4">
                {extras.photos.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {extras.photos.map((photo: string, idx: number) => (
                      <img
                        key={idx}
                        src={photo}
                        alt={`Photo ${idx + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                    ))}
                  </div>
                )}
                {extras.notes && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Additional Notes</h4>
                    <p className="text-sm text-muted-foreground">{extras.notes}</p>
                  </div>
                )}
                {extras.permitsConcern && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded">
                    <p className="text-sm text-amber-800">
                      ⚠️ Permits or compliance requirements may apply
                    </p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>

        {/* CTA */}
        <div className="pt-6 border-t">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-charcoal mb-2">Ready to Post?</h3>
              <p className="text-sm text-muted-foreground">
                Your job will be visible to verified professionals who match your requirements. 
                You'll receive quotes within 24-48 hours.
              </p>
            </div>
            <Button
              size="lg"
              onClick={onSubmit}
              disabled={loading}
              className="bg-gradient-hero text-white px-8"
            >
              {loading ? 'Creating Job...' : 'Create Job & Get Quotes'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
