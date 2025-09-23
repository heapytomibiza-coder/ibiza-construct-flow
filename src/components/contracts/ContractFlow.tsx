import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, FileText, Shield, CheckCircle } from 'lucide-react';
import { PaymentTermsChips, TimelineChips, ProtectionChips } from './ContractTermsChips';

interface ContractFlowProps {
  offer: {
    id: string;
    taskerId: string;
    taskerName: string;
    amount: number;
    type: 'fixed' | 'hourly';
  };
  onComplete: (contractTerms: ContractTerms) => void;
  onCancel: () => void;
}

export interface ContractTerms {
  paymentTerms: string[];
  timeline: string[];
  protection: string[];
  additionalTerms?: string;
}

export const ContractFlow = ({ offer, onComplete, onCancel }: ContractFlowProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [terms, setTerms] = useState<ContractTerms>({
    paymentTerms: [],
    timeline: [],
    protection: [],
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const steps = [
    {
      title: "Payment Terms",
      description: "Choose how payments will be handled",
      component: (
        <PaymentTermsChips
          selectedOptions={terms.paymentTerms}
          onSelectionChange={(options) => setTerms(prev => ({ ...prev, paymentTerms: options }))}
        />
      ),
      validation: () => terms.paymentTerms.length > 0
    },
    {
      title: "Project Timeline",
      description: "Set the start date and schedule",
      component: (
        <TimelineChips
          selectedOptions={terms.timeline}
          onSelectionChange={(options) => setTerms(prev => ({ ...prev, timeline: options }))}
        />
      ),
      validation: () => terms.timeline.length > 0
    },
    {
      title: "Protection & Guarantees",
      description: "Select additional protections and guarantees",
      component: (
        <ProtectionChips
          selectedOptions={terms.protection}
          onSelectionChange={(options) => setTerms(prev => ({ ...prev, protection: options }))}
        />
      ),
      validation: () => true // Optional step
    },
    {
      title: "Review Contract",
      description: "Review and finalize the contract terms",
      component: (
        <Card className="p-6">
          <div className="space-y-6">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Contract Summary</h3>
              <p className="text-muted-foreground">Review the terms before finalizing</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gradient-card rounded-lg">
                <h4 className="font-semibold mb-2">Professional & Amount</h4>
                <p>{offer.taskerName}</p>
                <p className="text-2xl font-bold text-primary">
                  €{offer.amount}
                  {offer.type === 'hourly' && <span className="text-sm font-normal">/hour</span>}
                </p>
              </div>

              {terms.paymentTerms.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Payment Terms</h4>
                  <p className="text-sm text-muted-foreground capitalize">
                    {terms.paymentTerms[0].replace('-', ' ')}
                  </p>
                </div>
              )}

              {terms.timeline.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Timeline</h4>
                  <p className="text-sm text-muted-foreground capitalize">
                    {terms.timeline[0].replace('-', ' ')}
                  </p>
                </div>
              )}

              {terms.protection.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Protections</h4>
                  <div className="space-y-1">
                    {terms.protection.map(protection => (
                      <p key={protection} className="text-sm text-muted-foreground flex items-center">
                        <Shield className="w-3 h-3 mr-2" />
                        {protection.replace('-', ' ')}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Additional Terms (Optional)
              </label>
              <textarea
                placeholder="Any additional terms or conditions..."
                value={terms.additionalTerms || ''}
                onChange={(e) => setTerms(prev => ({ ...prev, additionalTerms: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px] resize-none"
              />
            </div>
          </div>
        </Card>
      ),
      validation: () => true
    },
  ];

  const currentStepData = steps[currentStep - 1];
  const canProceed = currentStepData.validation();

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete(terms);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="mb-4">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground mt-2">
                Step {currentStep} of {totalSteps}
              </p>
            </div>
            <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
            <CardDescription>{currentStepData.description}</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {currentStepData.component}
            
            <div className="flex justify-between items-center pt-4">
              <div className="flex gap-2">
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  onClick={onCancel}
                  className="text-muted-foreground"
                >
                  Cancel
                </Button>
              </div>
              
              <Button
                onClick={handleNext}
                disabled={!canProceed}
                className="flex items-center gap-2"
              >
                {currentStep === totalSteps ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Create Contract
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};