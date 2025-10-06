import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Image, MessageSquare, Receipt, FileCheck, File, X, CheckCircle2 } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';

export type EvidenceCategory = 'photos' | 'documents' | 'messages' | 'receipts' | 'work_logs' | 'contracts' | 'invoices' | 'other';

interface EvidenceFile {
  file: File;
  category: EvidenceCategory;
  preview?: string;
}

interface EnhancedEvidenceManagerProps {
  disputeId?: string;
  onUpload: (files: EvidenceFile[]) => Promise<void>;
  requiredTypes?: string[];
  uploadedCategories?: string[];
}

const CATEGORY_OPTIONS: Array<{
  value: EvidenceCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}> = [
  { value: 'photos', label: 'Photos', icon: Image, description: 'Visual evidence of work or issues' },
  { value: 'documents', label: 'Documents', icon: FileText, description: 'General documentation' },
  { value: 'messages', label: 'Messages', icon: MessageSquare, description: 'Communication records' },
  { value: 'receipts', label: 'Receipts', icon: Receipt, description: 'Payment receipts' },
  { value: 'work_logs', label: 'Work Logs', icon: FileCheck, description: 'Time or work tracking' },
  { value: 'contracts', label: 'Contracts', icon: FileText, description: 'Agreements and contracts' },
  { value: 'invoices', label: 'Invoices', icon: Receipt, description: 'Billing documents' },
  { value: 'other', label: 'Other', icon: File, description: 'Other supporting files' },
];

export function EnhancedEvidenceManager({ 
  disputeId, 
  onUpload, 
  requiredTypes = [],
  uploadedCategories = []
}: EnhancedEvidenceManagerProps) {
  const [selectedCategory, setSelectedCategory] = useState<EvidenceCategory>('photos');
  const [pendingFiles, setPendingFiles] = useState<EvidenceFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      category: selectedCategory,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));
    setPendingFiles(prev => [...prev, ...newFiles]);
  }, [selectedCategory]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
      'application/pdf': ['.pdf'],
      'video/*': ['.mp4', '.mov'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10485760, // 10MB
    multiple: true
  });

  const removeFile = (index: number) => {
    setPendingFiles(prev => {
      const file = prev[index];
      if (file.preview) URL.revokeObjectURL(file.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleUpload = async () => {
    if (pendingFiles.length === 0) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      await onUpload(pendingFiles);
      setPendingFiles([]);
      setUploadProgress(100);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const completedRequirements = requiredTypes.filter(type => 
    uploadedCategories.includes(type)
  );
  const completionPercentage = requiredTypes.length > 0 
    ? Math.round((completedRequirements.length / requiredTypes.length) * 100)
    : 0;

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Upload Evidence</CardTitle>
            <CardDescription>
              Strong evidence leads to faster, fairer resolutions
            </CardDescription>
          </div>
          {requiredTypes.length > 0 && (
            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">{completionPercentage}%</span>
                {completionPercentage === 100 && (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {completedRequirements.length} of {requiredTypes.length} required
              </p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Selection */}
        <div>
          <label className="text-sm font-medium mb-3 block">Evidence Type</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {CATEGORY_OPTIONS.map(cat => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.value;
              const isRequired = requiredTypes.includes(cat.value);
              const isUploaded = uploadedCategories.includes(cat.value);
              
              return (
                <Button
                  key={cat.value}
                  type="button"
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    'h-auto py-2 px-3 justify-start relative',
                    isRequired && 'ring-1 ring-amber-500/50'
                  )}
                  onClick={() => setSelectedCategory(cat.value)}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  <span className="text-xs">{cat.label}</span>
                  {isUploaded && (
                    <CheckCircle2 className="h-3 w-3 ml-auto text-green-500" />
                  )}
                </Button>
              );
            })}
          </div>
          {requiredTypes.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              <span className="inline-block w-2 h-2 bg-amber-500 rounded-full mr-1" />
              Highlighted categories are suggested for this dispute type
            </p>
          )}
        </div>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
          )}
        >
          <input {...getInputProps()} />
          <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
          {isDragActive ? (
            <p className="text-sm font-medium">Drop files here...</p>
          ) : (
            <>
              <p className="text-sm font-medium mb-1">Drag & drop files here, or click to browse</p>
              <p className="text-xs text-muted-foreground">
                Max 10MB per file • JPG, PNG, PDF, MP4, MOV, DOCX
              </p>
            </>
          )}
        </div>

        {/* Pending Files */}
        {pendingFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Ready to Upload ({pendingFiles.length})</h3>
              <Button
                onClick={handleUpload}
                disabled={uploading}
                size="sm"
              >
                {uploading ? 'Uploading...' : 'Upload All'}
              </Button>
            </div>
            <div className="grid gap-2">
              {pendingFiles.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card"
                >
                  {item.preview ? (
                    <img
                      src={item.preview}
                      alt={item.file.name}
                      className="h-12 w-12 object-cover rounded"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.file.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {(item.file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <Progress value={uploadProgress} />
            <p className="text-xs text-center text-muted-foreground">
              Uploading files...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
