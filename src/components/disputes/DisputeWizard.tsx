import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, ArrowLeft, ArrowRight } from 'lucide-react';
import { DisputeGuidanceWizard } from './DisputeGuidanceWizard';
import { DisputeTypeSelector, type DisputeCategory } from './DisputeTypeSelector';
import { EnhancedEvidenceManager, type EvidenceCategory } from './EnhancedEvidenceManager';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface DisputeForm {
  type: string;
  title: string;
  description: string;
  amountDisputed: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  jobId: string;
  contractId?: string;
  invoiceId?: string;
  disputeCategory?: DisputeCategory;
  requiredEvidenceTypes?: string[];
  preDisputeContactAttempted?: boolean;
  disputedAgainst: string;
}

interface DisputeWizardProps {
  onClose: () => void;
  onSubmit: (dispute: DisputeForm) => Promise<{ id?: string } | void>;
  jobId: string;
  disputedAgainst: string;
}

export const DisputeWizard = ({ onClose, onSubmit, jobId, disputedAgainst }: DisputeWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0); // Start at 0 for guidance
  const [formData, setFormData] = useState<DisputeForm>({
    type: '',
    title: '',
    description: '',
    amountDisputed: 0,
    priority: 'medium',
    jobId,
    disputedAgainst,
    disputeCategory: undefined,
    requiredEvidenceTypes: [],
    preDisputeContactAttempted: false,
  });
  const [pendingEvidence, setPendingEvidence] = useState<Array<{ file: File; category: EvidenceCategory }>>([]);
  const [createdDisputeId, setCreatedDisputeId] = useState<string | null>(null);
  const [uploadedCategories, setUploadedCategories] = useState<string[]>([]);

  const totalSteps = 5; // 0: Guidance, 1: Type, 2: Details, 3: More Details, 4: Evidence
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const result = await onSubmit(formData);
      if (result && 'id' in result && result.id) {
        setCreatedDisputeId(result.id);
        // Move to evidence upload if we have pending evidence
        if (pendingEvidence.length > 0) {
          setCurrentStep(4);
        } else {
          onClose();
        }
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Failed to submit dispute:', error);
    }
  };

  const handleEvidenceUpload = async (files: Array<{ file: File; category: EvidenceCategory }>) => {
    setPendingEvidence(files);
    const categories = [...new Set(files.map(f => f.category))];
    setUploadedCategories(prev => [...new Set([...prev, ...categories])]);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return true; // Guidance always valid
      case 1: return !!formData.disputeCategory; // Type selection
      case 2: return !!formData.title && !!formData.description; // Details
      case 3: return true; // Additional details optional
      case 4: return true; // Evidence optional
      default: return false;
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              File a Dispute - Step {currentStep + 1} of {totalSteps}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              We'll help you resolve this issue quickly and fairly
            </p>
          </div>
          <Button variant="ghost" onClick={onClose}>✕</Button>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{currentStep + 1}/{totalSteps}</span>
          </div>
          <Progress value={progress} />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Step 0: Guidance */}
        {currentStep === 0 && (
          <DisputeGuidanceWizard
            onContinue={(contactAttempted) => {
              setFormData(prev => ({ ...prev, preDisputeContactAttempted: contactAttempted }));
              handleNext();
            }}
          />
        )}

        {/* Step 1: Type Selection */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <DisputeTypeSelector
              value={formData.disputeCategory}
              onChange={(category, suggestedEvidence) => {
                setFormData(prev => ({
                  ...prev,
                  disputeCategory: category,
                  requiredEvidenceTypes: suggestedEvidence,
                  type: category
                }));
              }}
            />
            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={handlePrevious}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                disabled={!isStepValid()}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Title and Description */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Dispute Details</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Provide a clear description of the issue
              </p>
            </div>

            <div>
              <Label htmlFor="dispute-title">Dispute Title</Label>
              <Input
                id="dispute-title"
                placeholder="Brief summary of the issue..."
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="dispute-description">Detailed Description</Label>
              <Textarea
                id="dispute-description"
                placeholder="Please provide a detailed explanation..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={6}
                className="mt-1"
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={handlePrevious}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                disabled={!isStepValid()}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Amount and Priority */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Additional Details</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Optional but helpful information
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount-disputed">Amount in Dispute (€)</Label>
                <Input
                  id="amount-disputed"
                  type="number"
                  placeholder="0.00"
                  value={formData.amountDisputed || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, amountDisputed: parseFloat(e.target.value) || 0 }))}
                />
              </div>

              <div>
                <Label htmlFor="priority">Priority Level</Label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                >
                  <option value="low">Low - Can wait a few days</option>
                  <option value="medium">Medium - Normal resolution time</option>
                  <option value="high">High - Needs quick attention</option>
                  <option value="urgent">Urgent - Same day resolution needed</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={handlePrevious}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button type="button" onClick={handleNext}>
                Continue to Evidence
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Evidence Upload */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <EnhancedEvidenceManager
              disputeId={createdDisputeId || undefined}
              onUpload={handleEvidenceUpload}
              requiredTypes={formData.requiredEvidenceTypes}
              uploadedCategories={uploadedCategories}
            />
            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={handlePrevious}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button type="button" onClick={handleSubmit}>
                Submit Dispute
                <AlertTriangle className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
