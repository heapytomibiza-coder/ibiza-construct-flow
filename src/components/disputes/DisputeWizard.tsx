import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, FileText, Camera, Upload, 
  ArrowLeft, ArrowRight, Check, Clock, 
  Euro, MessageSquare, Shield, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DisputeForm {
  type: string;
  title: string;
  description: string;
  amountDisputed: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  jobId: string;
  contractId?: string;
  invoiceId?: string;
  evidence: File[];
  communicationHistory: boolean;
  preferredResolution: string;
}

interface EvidenceFile {
  id: string;
  file: File;
  type: 'photo' | 'document' | 'communication' | 'invoice';
  description: string;
  preview?: string;
}

const disputeTypes = [
  { id: 'payment', label: 'Payment Issue', description: 'Problems with payment processing or billing' },
  { id: 'quality', label: 'Work Quality', description: 'Work does not meet agreed standards' },
  { id: 'scope', label: 'Scope Change', description: 'Disagreement about project scope or changes' },
  { id: 'timeline', label: 'Timeline Dispute', description: 'Delays or timeline disagreements' },
  { id: 'materials', label: 'Materials Issue', description: 'Problems with materials or supplies' },
  { id: 'communication', label: 'Communication Problem', description: 'Lack of communication or miscommunication' }
];

const mockJobs = [
  { id: '1', title: 'Bathroom Renovation', professional: 'Maria Santos' },
  { id: '2', title: 'Kitchen Upgrade', professional: 'João Silva' },
  { id: '3', title: 'Electrical Work', professional: 'Ahmed Al-Rashid' }
];

export const DisputeWizard = ({ onClose, onSubmit }: { 
  onClose: () => void; 
  onSubmit: (dispute: DisputeForm) => void;
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<DisputeForm>({
    type: '',
    title: '',
    description: '',
    amountDisputed: 0,
    priority: 'medium',
    jobId: '',
    contractId: '',
    invoiceId: '',
    evidence: [],
    communicationHistory: false,
    preferredResolution: ''
  });
  const [evidenceFiles, setEvidenceFiles] = useState<EvidenceFile[]>([]);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileUpload = (files: FileList | null, type: EvidenceFile['type']) => {
    if (!files) return;

    Array.from(files).forEach(file => {
      const evidenceFile: EvidenceFile = {
        id: Math.random().toString(36).substring(7),
        file,
        type,
        description: '',
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      };
      setEvidenceFiles(prev => [...prev, evidenceFile]);
    });
  };

  const removeEvidenceFile = (id: string) => {
    setEvidenceFiles(prev => prev.filter(f => f.id !== id));
  };

  const updateEvidenceDescription = (id: string, description: string) => {
    setEvidenceFiles(prev => 
      prev.map(f => f.id === id ? { ...f, description } : f)
    );
  };

  const handleSubmit = () => {
    const finalData = {
      ...formData,
      evidence: evidenceFiles.map(ef => ef.file)
    };
    onSubmit(finalData);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return formData.type && formData.jobId;
      case 2: return formData.title && formData.description;
      case 3: return true; // Evidence is optional
      case 4: return formData.preferredResolution;
      default: return false;
    }
  };

  const Step1TypeSelection = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">What type of dispute are you filing?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Select the category that best describes your issue
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {disputeTypes.map(type => (
          <button
            key={type.id}
            onClick={() => setFormData(prev => ({ ...prev, type: type.id }))}
            className={cn(
              "p-4 rounded-lg border-2 text-left transition-all hover:border-copper/50",
              formData.type === type.id 
                ? "border-copper bg-copper/5" 
                : "border-sand-dark/20"
            )}
          >
            <h4 className="font-medium text-charcoal mb-1">{type.label}</h4>
            <p className="text-sm text-muted-foreground">{type.description}</p>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <Label htmlFor="job-select">Related Job</Label>
        <select
          id="job-select"
          value={formData.jobId}
          onChange={(e) => setFormData(prev => ({ ...prev, jobId: e.target.value }))}
          className="w-full px-3 py-2 border border-border rounded-lg"
        >
          <option value="">Select a job...</option>
          {mockJobs.map(job => (
            <option key={job.id} value={job.id}>
              {job.title} - {job.professional}
            </option>
          ))}
        </select>
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
            className="w-full px-3 py-2 border border-border rounded-lg"
          >
            <option value="low">Low - Can wait a few days</option>
            <option value="medium">Medium - Normal resolution time</option>
            <option value="high">High - Needs quick attention</option>
            <option value="urgent">Urgent - Same day resolution needed</option>
          </select>
        </div>
      </div>
    </div>
  );

  const Step2Details = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Dispute Details</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Provide a clear description of the issue and what happened
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
          placeholder="Please provide a detailed explanation of what happened, when it occurred, and what you expected vs. what actually happened..."
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={6}
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Be specific and include dates, times, and any relevant details
        </p>
      </div>

      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-800 mb-1">Tips for a Strong Dispute</p>
            <ul className="text-sm text-blue-600 space-y-1">
              <li>• Be factual and objective in your description</li>
              <li>• Include specific dates and timeline of events</li>
              <li>• Reference any agreements or contracts</li>
              <li>• Mention previous communication attempts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const Step3Evidence = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Supporting Evidence</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Upload photos, documents, or other evidence to support your dispute
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border-2 border-dashed border-sand-dark/30 rounded-lg text-center hover:border-copper/50 transition-colors">
          <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="font-medium mb-1">Upload Photos</p>
          <p className="text-sm text-muted-foreground mb-2">Show the issue or completed work</p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileUpload(e.target.files, 'photo')}
            className="hidden"
            id="photo-upload"
          />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => document.getElementById('photo-upload')?.click()}
          >
            Choose Photos
          </Button>
        </div>

        <div className="p-4 border-2 border-dashed border-sand-dark/30 rounded-lg text-center hover:border-copper/50 transition-colors">
          <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="font-medium mb-1">Upload Documents</p>
          <p className="text-sm text-muted-foreground mb-2">Contracts, invoices, or receipts</p>
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt"
            onChange={(e) => handleFileUpload(e.target.files, 'document')}
            className="hidden"
            id="document-upload"
          />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => document.getElementById('document-upload')?.click()}
          >
            Choose Files
          </Button>
        </div>
      </div>

      {evidenceFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Uploaded Evidence ({evidenceFiles.length})</h4>
          <div className="space-y-2">
            {evidenceFiles.map(evidence => (
              <div key={evidence.id} className="flex items-center gap-3 p-3 border border-sand-dark/20 rounded-lg">
                {evidence.preview ? (
                  <img 
                    src={evidence.preview} 
                    alt="Evidence" 
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 bg-sand-light rounded flex items-center justify-center">
                    <FileText className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                
                <div className="flex-1">
                  <p className="font-medium text-sm">{evidence.file.name}</p>
                  <Input
                    placeholder="Add description..."
                    value={evidence.description}
                    onChange={(e) => updateEvidenceDescription(evidence.id, e.target.value)}
                    className="mt-1 text-sm"
                  />
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEvidenceFile(evidence.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="communication-history"
          checked={formData.communicationHistory}
          onChange={(e) => setFormData(prev => ({ ...prev, communicationHistory: e.target.checked }))}
        />
        <Label htmlFor="communication-history" className="text-sm">
          Include chat/message history from the platform
        </Label>
      </div>
    </div>
  );

  const Step4Resolution = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Preferred Resolution</h3>
        <p className="text-sm text-muted-foreground mb-4">
          What would you like to see happen to resolve this dispute?
        </p>
      </div>

      <div>
        <Label htmlFor="preferred-resolution">Resolution Details</Label>
        <Textarea
          id="preferred-resolution"
          placeholder="Describe your preferred outcome: refund, re-work, partial payment, etc..."
          value={formData.preferredResolution}
          onChange={(e) => setFormData(prev => ({ ...prev, preferredResolution: e.target.value }))}
          rows={4}
          className="mt-1"
        />
      </div>

      <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-orange-600 mt-0.5" />
          <div>
            <p className="font-medium text-orange-800 mb-1">Resolution Timeline</p>
            <p className="text-sm text-orange-600">
              We guarantee a response within 24 hours and aim for full resolution within 48-72 hours. 
              You'll receive regular updates throughout the process.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <p className="font-medium text-green-800 mb-1">Fair Resolution Process</p>
            <p className="text-sm text-green-600">
              Our mediation team will review all evidence and facilitate communication between 
              both parties to reach a fair resolution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="card-luxury max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              File a Dispute - Step {currentStep} of {totalSteps}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              We'll help you resolve this issue quickly and fairly
            </p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            ✕
          </Button>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{currentStep}/{totalSteps}</span>
          </div>
          <Progress value={progress} />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {currentStep === 1 && <Step1TypeSelection />}
        {currentStep === 2 && <Step2Details />}
        {currentStep === 3 && <Step3Evidence />}
        {currentStep === 4 && <Step4Resolution />}

        <div className="flex items-center justify-between pt-6 border-t border-sand-dark/20">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep === totalSteps ? (
            <Button
              onClick={handleSubmit}
              disabled={!isStepValid()}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Submit Dispute
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="bg-gradient-hero text-white"
            >
              Next Step
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};