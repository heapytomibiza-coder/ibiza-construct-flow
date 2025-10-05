import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, Upload, X, Check } from 'lucide-react';
import { useImageOCR } from '@/hooks/useImageOCR';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface InlineCameraCaptureProps {
  onCapture: (file: File, extractedData?: any) => void;
  onCancel?: () => void;
  enableOCR?: boolean;
  className?: string;
}

export const InlineCameraCapture = ({
  onCapture,
  onCancel,
  enableOCR = true,
  className
}: InlineCameraCaptureProps) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { extractTextFromImage, isProcessing, extractedData } = useImageOCR();
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image under 10MB',
        variant: 'destructive',
      });
      return;
    }

    // Preview image
    const reader = new FileReader();
    reader.onloadend = () => {
      setCapturedImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    setImageFile(file);

    // Extract text if OCR enabled
    if (enableOCR) {
      await extractTextFromImage(file);
    }
  };

  const handleConfirm = () => {
    if (imageFile) {
      onCapture(imageFile, extractedData);
      handleReset();
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerCamera = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-4", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!capturedImage ? (
        // Initial state - capture button
        <Card className="p-8 border-2 border-dashed">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-4 rounded-full bg-primary/10">
              <Camera className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">Add Photos</p>
              <p className="text-sm text-muted-foreground">
                {enableOCR
                  ? 'Camera opens → auto-extract measurements/notes'
                  : 'Take a photo or upload from gallery'}
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={triggerCamera} size="lg">
                <Camera className="w-5 h-5 mr-2" />
                Open Camera
              </Button>
              <Button
                variant="outline"
                onClick={triggerCamera}
                size="lg"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        // Preview state
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="relative aspect-video bg-black">
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-contain"
              />
            </div>
          </Card>

          {/* OCR Results */}
          {enableOCR && isProcessing && (
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">
                  Extracting text from image...
                </p>
              </div>
            </Card>
          )}

          {enableOCR && extractedData && !isProcessing && (
            <Card className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <p className="font-medium text-sm">Text Extracted</p>
              </div>
              
              {extractedData.measurements && extractedData.measurements.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                    Measurements
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {extractedData.measurements.map((m: string, i: number) => (
                      <span key={i} className="px-2 py-1 text-xs rounded-md bg-secondary">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {extractedData.text && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                    Full Text
                  </p>
                  <p className="text-sm">{extractedData.text.substring(0, 150)}...</p>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Review and edit the extracted information in the form fields
              </p>
            </Card>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleConfirm}
              disabled={isProcessing}
              className="flex-1"
              size="lg"
            >
              <Check className="w-5 h-5 mr-2" />
              Use This Photo
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isProcessing}
              size="lg"
            >
              <X className="w-5 h-5 mr-2" />
              Retake
            </Button>
          </div>

          {onCancel && (
            <Button
              variant="ghost"
              onClick={onCancel}
              className="w-full"
              disabled={isProcessing}
            >
              Cancel
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
