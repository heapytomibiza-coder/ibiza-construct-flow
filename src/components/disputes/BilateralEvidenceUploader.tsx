/**
 * Bilateral Evidence Uploader
 * Shows evidence from both parties side-by-side
 */

import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Evidence {
  id: string;
  uploaded_by_role: string;
  evidence_type: string;
  file_name: string;
  description: string;
  created_at: string;
}

interface BilateralEvidenceUploaderProps {
  evidence: Evidence[];
  onUpload: () => void;
}

export function BilateralEvidenceUploader({ evidence, onUpload }: BilateralEvidenceUploaderProps) {
  const clientEvidence = evidence.filter(e => e.uploaded_by_role === 'client');
  const professionalEvidence = evidence.filter(e => e.uploaded_by_role === 'professional');

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Client Evidence */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Client Evidence</h3>
          <Badge>{clientEvidence.length}</Badge>
        </div>
        <div className="space-y-3">
          {clientEvidence.map(e => (
            <div key={e.id} className="border rounded p-3 text-sm">
              <div className="font-medium">{e.file_name}</div>
              <div className="text-muted-foreground">{e.description}</div>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="w-full mt-4" onClick={onUpload}>
          <Upload className="w-4 h-4 mr-2" />
          Upload Evidence
        </Button>
      </Card>

      {/* Professional Evidence */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Professional Evidence</h3>
          <Badge>{professionalEvidence.length}</Badge>
        </div>
        <div className="space-y-3">
          {professionalEvidence.map(e => (
            <div key={e.id} className="border rounded p-3 text-sm">
              <div className="font-medium">{e.file_name}</div>
              <div className="text-muted-foreground">{e.description}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}