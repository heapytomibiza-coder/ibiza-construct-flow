import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Upload, 
  X, 
  FileText, 
  Shield, 
  Building, 
  CreditCard, 
  Award, 
  Loader2,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

interface DocumentUploadProps {
  professionalId: string;
  onDocumentsUpdate?: () => void;
}

interface ProfessionalDocument {
  id: string;
  document_type: string;
  file_name: string;
  verification_status: string;
  verification_notes?: string;
  expires_at?: string;
  created_at: string;
}

const documentTypes = [
  {
    type: 'insurance',
    label: 'Liability Insurance',
    icon: Shield,
    description: 'Required for most service types',
    required: true
  },
  {
    type: 'business_license',
    label: 'Business License',
    icon: Building,
    description: 'Government-issued business registration',
    required: true
  },
  {
    type: 'tax_certificate',
    label: 'Tax Certificate',
    icon: CreditCard,
    description: 'Valid tax registration document',
    required: false
  },
  {
    type: 'certification',
    label: 'Professional Certifications',
    icon: Award,
    description: 'Trade-specific certifications',
    required: false
  }
];

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  professionalId,
  onDocumentsUpdate
}) => {
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<ProfessionalDocument[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    loadDocuments();
  }, [professionalId]);

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('professional_documents')
        .select('*')
        .eq('professional_id', professionalId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (file: File, documentType: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${professionalId}/${documentType}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('professional-documents')
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('professional-documents')
      .getPublicUrl(fileName);

    // Save document record
    const { error: dbError } = await supabase
      .from('professional_documents')
      .insert({
        professional_id: professionalId,
        document_type: documentType,
        file_url: publicUrl,
        file_name: file.name,
        file_size: file.size
      });

    if (dbError) throw dbError;
  };

  const createDropzoneForType = (documentType: string) => {
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      setUploading(true);
      try {
        const file = acceptedFiles[0];
        await uploadDocument(file, documentType);
        await loadDocuments();
        onDocumentsUpdate?.();
        toast.success('Document uploaded successfully');
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Failed to upload document');
      } finally {
        setUploading(false);
      }
    }, [documentType]);

    return useDropzone({
      onDrop,
      accept: {
        'application/pdf': ['.pdf'],
        'image/*': ['.jpeg', '.jpg', '.png'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
      },
      multiple: false,
      disabled: uploading
    });
  };

  const getDocumentForType = (type: string) => {
    return documents.find(doc => doc.document_type === type);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const removeDocument = async (documentId: string) => {
    try {
      const { error } = await supabase
        .from('professional_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;
      
      await loadDocuments();
      onDocumentsUpdate?.();
      toast.success('Document removed');
    } catch (error) {
      console.error('Error removing document:', error);
      toast.error('Failed to remove document');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Document Verification</h3>
        <p className="text-sm text-muted-foreground">
          Upload required documents to verify your professional credentials
        </p>
      </div>

      {documentTypes.map((docType) => {
        const existingDoc = getDocumentForType(docType.type);
        const dropzone = createDropzoneForType(docType.type);
        const IconComponent = docType.icon;

        return (
          <Card key={docType.type}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <IconComponent className="w-5 h-5 text-primary" />
                  <div>
                    <div className="flex items-center gap-2">
                      {docType.label}
                      {docType.required && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground font-normal">
                      {docType.description}
                    </p>
                  </div>
                </div>
                {existingDoc && (
                  <div className="flex items-center gap-2">
                    {getStatusIcon(existingDoc.verification_status)}
                    <Badge variant={getStatusBadgeVariant(existingDoc.verification_status)}>
                      {existingDoc.verification_status}
                    </Badge>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {existingDoc ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{existingDoc.file_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded {new Date(existingDoc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeDocument(existingDoc.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {existingDoc.verification_notes && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong>Review notes:</strong> {existingDoc.verification_notes}
                      </p>
                    </div>
                  )}

                  <div
                    {...dropzone.getRootProps()}
                    className="border-2 border-dashed border-muted rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <input {...dropzone.getInputProps()} />
                    <p className="text-sm text-muted-foreground">
                      Click to replace document
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  {...dropzone.getRootProps()}
                  className={`
                    border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
                    ${dropzone.isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                    ${uploading ? 'pointer-events-none opacity-50' : ''}
                  `}
                >
                  <input {...dropzone.getInputProps()} />
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Uploading...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-6 h-6 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        {dropzone.isDragActive ? 'Drop document here' : 'Click to upload document'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF, DOC, DOCX, JPG, PNG up to 10MB
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};