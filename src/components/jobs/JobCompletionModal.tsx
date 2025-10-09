import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Loader2, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface JobCompletionModalProps {
  open: boolean;
  onClose: () => void;
  jobId: string;
  professionalId: string;
  onComplete: () => void;
}

export const JobCompletionModal: React.FC<JobCompletionModalProps> = ({
  open,
  onClose,
  jobId,
  professionalId,
  onComplete
}) => {
  const [beforePhotos, setBeforePhotos] = useState<string[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const uploadPhotos = async (files: File[], type: 'before' | 'after') => {
    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${jobId}/${type}-${Date.now()}-${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('job-photos')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('job-photos')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      if (type === 'before') {
        setBeforePhotos([...beforePhotos, ...uploadedUrls]);
      } else {
        setAfterPhotos([...afterPhotos, ...uploadedUrls]);
      }

      toast.success(`${uploadedUrls.length} ${type} photo(s) uploaded`);
    } catch (error: any) {
      toast.error(`Failed to upload ${type} photos`);
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps: getBeforeProps, getInputProps: getBeforeInputs, isDragActive: isBeforeDrag } = useDropzone({
    onDrop: (files) => uploadPhotos(files, 'before'),
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 5,
    disabled: uploading || beforePhotos.length >= 5
  });

  const { getRootProps: getAfterProps, getInputProps: getAfterInputs, isDragActive: isAfterDrag } = useDropzone({
    onDrop: (files) => uploadPhotos(files, 'after'),
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 5,
    disabled: uploading || afterPhotos.length >= 5
  });

  const removePhoto = (index: number, type: 'before' | 'after') => {
    if (type === 'before') {
      setBeforePhotos(beforePhotos.filter((_, i) => i !== index));
    } else {
      setAfterPhotos(afterPhotos.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    if (afterPhotos.length < 2) {
      toast.error('Please upload at least 2 after photos');
      return;
    }

    setSubmitting(true);
    try {
      // Save before photos
      for (const photo of beforePhotos) {
        await supabase.from('job_photos').insert({
          job_id: jobId,
          photo_type: 'before',
          image_url: photo,
          uploaded_by: professionalId
        });
      }

      // Save after photos
      for (const photo of afterPhotos) {
        await supabase.from('job_photos').insert({
          job_id: jobId,
          photo_type: 'after',
          image_url: photo,
          uploaded_by: professionalId
        });
      }

      // Update job status
      await supabase.from('jobs').update({ status: 'complete_pending' }).eq('id', jobId);

      toast.success('Job marked as complete! Client will review.');
      onComplete();
      onClose();
    } catch (error: any) {
      toast.error('Failed to complete job');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Job - Upload Photos</DialogTitle>
          <DialogDescription>
            Upload before and after photos of the completed work
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Before Photos */}
          <div>
            <Label className="mb-2 block">Before Photos (Optional)</Label>
            <div
              {...getBeforeProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isBeforeDrag ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              } ${uploading || beforePhotos.length >= 5 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <input {...getBeforeInputs()} />
              <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">
                {isBeforeDrag ? 'Drop here' : 'Click or drag before photos'}
              </p>
              <p className="text-xs text-muted-foreground">{beforePhotos.length}/5 uploaded</p>
            </div>
            {beforePhotos.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-3">
                {beforePhotos.map((photo, i) => (
                  <div key={i} className="relative">
                    <img src={photo} alt={`Before ${i + 1}`} className="w-full h-24 object-cover rounded-lg" />
                    <button
                      onClick={() => removePhoto(i, 'before')}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* After Photos */}
          <div>
            <Label className="mb-2 block">After Photos (Required - Min 2)*</Label>
            <div
              {...getAfterProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isAfterDrag ? 'border-primary bg-primary/5' : 'border-primary/30 hover:border-primary'
              } ${uploading || afterPhotos.length >= 5 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <input {...getAfterInputs()} />
              <Camera className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">
                {isAfterDrag ? 'Drop here' : 'Click or drag after photos'}
              </p>
              <p className="text-xs text-muted-foreground">
                {afterPhotos.length}/5 - {Math.max(0, 2 - afterPhotos.length)} more required
              </p>
            </div>
            {afterPhotos.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-3">
                {afterPhotos.map((photo, i) => (
                  <div key={i} className="relative">
                    <img src={photo} alt={`After ${i + 1}`} className="w-full h-24 object-cover rounded-lg" />
                    <button
                      onClick={() => removePhoto(i, 'after')}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label>Notes (Optional)</Label>
            <Textarea
              placeholder="Add any notes about the completed work..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-2"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={afterPhotos.length < 2 || submitting}>
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Completing...
              </>
            ) : (
              'Complete Job'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
