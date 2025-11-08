import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, FileText, CheckCircle, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface DocumentUploadProps {
  professionalId: string;
  onDocumentsUpdate?: () => void;
}

interface UploadedFile {
  name: string;
  url: string;
  size: number;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

export function DocumentUpload({ professionalId, onDocumentsUpdate }: DocumentUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

    setUploading(true);
    const newFiles: UploadedFile[] = [];

    try {
      for (const file of Array.from(files)) {
        // Validate file
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name} exceeds 10MB limit`);
          continue;
        }
        if (!ALLOWED_TYPES.includes(file.type)) {
          toast.error(`${file.name} is not a supported format (PDF, JPG, PNG only)`);
          continue;
        }

        // Upload to storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('verification-documents')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('verification-documents')
          .getPublicUrl(fileName);

        newFiles.push({
          name: file.name,
          url: publicUrl,
          size: file.size,
        });
      }

      if (newFiles.length > 0) {
        // Update verification record with new document URLs
        const allUrls = [...uploadedFiles, ...newFiles].map(f => f.url);
        
        const { error: updateError } = await supabase
          .from('professional_verifications')
          .update({ document_urls: allUrls })
          .eq('professional_id', professionalId)
          .eq('status', 'pending');

        if (updateError) throw updateError;

        setUploadedFiles(prev => [...prev, ...newFiles]);
        toast.success(`${newFiles.length} document(s) uploaded successfully`);
        onDocumentsUpdate?.();
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload documents');
    } finally {
      setUploading(false);
      event.target.value = ''; // Reset input
    }
  };

  const removeFile = async (url: string) => {
    try {
      const fileName = url.split('/verification-documents/')[1];
      
      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('verification-documents')
        .remove([fileName]);

      if (deleteError) throw deleteError;

      // Update state and database
      const updatedFiles = uploadedFiles.filter(f => f.url !== url);
      setUploadedFiles(updatedFiles);

      const { error: updateError } = await supabase
        .from('professional_verifications')
        .update({ document_urls: updatedFiles.map(f => f.url) })
        .eq('professional_id', professionalId)
        .eq('status', 'pending');

      if (updateError) throw updateError;

      toast.success('Document removed');
      onDocumentsUpdate?.();
    } catch (error: any) {
      console.error('Remove error:', error);
      toast.error(error.message || 'Failed to remove document');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Verification Documents</CardTitle>
        <CardDescription>
          Upload ID, licenses, certificates, or other supporting documents. 
          Accepted formats: PDF, JPG, PNG (max 10MB each)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
          <input
            type="file"
            id="file-upload"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="flex flex-col items-center gap-2">
              {uploading ? (
                <Loader2 className="w-10 h-10 text-muted-foreground animate-spin" />
              ) : (
                <Upload className="w-10 h-10 text-muted-foreground" />
              )}
              <p className="text-sm font-medium">
                {uploading ? 'Uploading...' : 'Click to upload documents'}
              </p>
              <p className="text-xs text-muted-foreground">
                PDF, JPG, or PNG up to 10MB
              </p>
            </div>
          </label>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Uploaded Documents ({uploadedFiles.length})</p>
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.url)}
                  className="ml-2 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <p>
          These documents will be reviewed by our admin team within 1-2 business days.
          Ensure all documents are clear and legible.
        </p>
      </CardFooter>
    </Card>
  );
}
