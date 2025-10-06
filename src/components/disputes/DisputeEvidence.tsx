import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDisputes } from '@/hooks/useDisputes';
import { FileText, Upload, Loader2, Download } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Evidence {
  id: string;
  evidence_type: string;
  description?: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

interface DisputeEvidenceProps {
  disputeId: string;
  evidence: Evidence[];
}

export const DisputeEvidence = ({ disputeId, evidence }: DisputeEvidenceProps) => {
  const [showUpload, setShowUpload] = useState(false);
  const [evidenceType, setEvidenceType] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const { uploadEvidence } = useDisputes();

  const handleUpload = async () => {
    if (!file || !evidenceType) return;

    await uploadEvidence.mutateAsync({
      disputeId,
      evidenceType,
      description,
      file,
    });

    setShowUpload(false);
    setEvidenceType('');
    setDescription('');
    setFile(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <>
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Evidence & Documentation</h3>
            <Button size="sm" onClick={() => setShowUpload(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Evidence
            </Button>
          </div>

          {evidence.length > 0 ? (
            <div className="space-y-3">
              {evidence.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{item.file_name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="capitalize">{item.evidence_type}</span>
                        <span>•</span>
                        <span>{formatFileSize(item.file_size)}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(item.created_at))} ago</span>
                      </div>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(item.file_url, '_blank')}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No evidence uploaded yet</p>
              <p className="text-sm">Upload documents, images, or other files to support your case</p>
            </div>
          )}
        </div>
      </Card>

      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Evidence</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Evidence Type</Label>
              <Select value={evidenceType} onValueChange={setEvidenceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contract">Contract/Agreement</SelectItem>
                  <SelectItem value="communication">Communication Record</SelectItem>
                  <SelectItem value="invoice">Invoice/Receipt</SelectItem>
                  <SelectItem value="photo">Photo/Screenshot</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="other">Other Document</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe what this evidence shows..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>File</Label>
              <Input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.mov"
              />
              <p className="text-xs text-muted-foreground">
                Accepted: PDF, Word, Images (JPG/PNG), Video (MP4/MOV) - Max 10MB
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowUpload(false)}
                disabled={uploadEvidence.isPending}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!file || !evidenceType || uploadEvidence.isPending}
                className="flex-1"
              >
                {uploadEvidence.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
