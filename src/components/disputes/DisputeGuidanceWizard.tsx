import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Clock, FileText, Shield } from 'lucide-react';
import { useState } from 'react';

interface DisputeGuidanceWizardProps {
  onContinue: (contactAttempted: boolean) => void;
}

export function DisputeGuidanceWizard({ onContinue }: DisputeGuidanceWizardProps) {
  const [contactAttempted, setContactAttempted] = useState(false);

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Before you file a dispute</CardTitle>
        <CardDescription>
          Let's make sure this is the right step and set clear expectations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Contact Attempt */}
        <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3 flex-1">
            <Switch
              id="contact-attempted"
              checked={contactAttempted}
              onCheckedChange={setContactAttempted}
            />
            <div className="flex-1">
              <Label htmlFor="contact-attempted" className="text-base font-medium cursor-pointer">
                I've tried to resolve this directly with the other party
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Direct communication often resolves issues faster
              </p>
            </div>
          </div>
        </div>

        {/* Key Information */}
        <div className="space-y-3">
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            What to Expect
          </h3>
          <div className="grid gap-3">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Typical resolution: 2–5 days</p>
                <p className="text-sm text-muted-foreground">
                  With complete evidence, most cases resolve quickly
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Evidence is key</p>
                <p className="text-sm text-muted-foreground">
                  Photos, contracts, messages, and receipts strengthen your case
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Fair, evidence-based decisions</p>
                <p className="text-sm text-muted-foreground">
                  We focus on resolution, not blame
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Protected communication</p>
                <p className="text-sm text-muted-foreground">
                  All dispute messages are secure and recorded
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Accepted File Types */}
        <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
          <p className="text-sm font-medium mb-2">Accepted evidence formats:</p>
          <p className="text-sm text-muted-foreground">
            Images (JPG, PNG), Documents (PDF, DOCX), Videos (MP4, MOV) — Max 10MB per file
          </p>
        </div>

        <Button 
          onClick={() => onContinue(contactAttempted)}
          className="w-full"
          size="lg"
        >
          Continue to File Dispute
        </Button>
      </CardContent>
    </Card>
  );
}
