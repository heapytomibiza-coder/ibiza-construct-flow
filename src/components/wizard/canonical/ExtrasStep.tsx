/**
 * Step 6: Extras (photos, notes, permits)
 * Optional but recommended additions
 */
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Upload, X, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InlineCameraCapture } from '@/components/camera/InlineCameraCapture';

interface ExtrasStepProps {
  microName: string;
  extras: {
    photos: string[];
    notes?: string;
    permitsConcern?: boolean;
  };
  onExtrasChange: (extras: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const COMMON_NOTES = [
  'Eco-friendly materials preferred',
  'Minimum disruption needed',
  'Part of larger renovation',
  'Matching existing style',
  'Historic building',
  'Need completion certificate'
];

export const ExtrasStep: React.FC<ExtrasStepProps> = ({
  microName,
  extras,
  onExtrasChange,
  onNext,
  onBack
}) => {
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const handleUpdate = (field: string, value: any) => {
    onExtrasChange({ ...extras, [field]: value });
  };

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setUploadingPhoto(true);
    try {
      // Mock upload for now - in production would upload to storage
      const newPhotos = [...extras.photos];
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPhotos.push(e.target?.result as string);
          if (i === files.length - 1) {
            handleUpdate('photos', newPhotos);
            setUploadingPhoto(false);
          }
        };
        reader.readAsDataURL(files[i]);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      setUploadingPhoto(false);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = extras.photos.filter((_, i) => i !== index);
    handleUpdate('photos', newPhotos);
  };

  const toggleNoteChip = (note: string) => {
    const currentNotes = extras.notes || '';
    if (currentNotes.includes(note)) {
      handleUpdate('notes', currentNotes.replace(note + '. ', '').replace(note, ''));
    } else {
      handleUpdate('notes', currentNotes ? `${currentNotes}. ${note}` : note);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div>
          <Badge variant="outline" className="mb-4">{microName}</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Add Photos & Notes
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Optional but helps professionals understand your project better
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Photo Upload */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Project Photos</h3>
              <p className="text-sm text-muted-foreground">
                Upload photos of the work area, existing conditions, or reference images
              </p>
            </div>
            <Badge variant="outline">{extras.photos.length} photos</Badge>
          </div>

          {/* Photo grid */}
          {extras.photos.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {extras.photos.map((photo, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={photo}
                    alt={`Upload ${idx + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removePhoto(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Camera / Upload buttons */}
          {!showCamera ? (
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-24 flex-col gap-2 border-2 border-dashed hover:border-primary hover:bg-primary/5"
                onClick={() => setShowCamera(true)}
              >
                <Camera className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm font-medium">Take Photo</span>
              </Button>
              
              <label className={cn(
                "h-24 border-2 border-dashed border-muted-foreground/30 rounded-lg",
                "flex flex-col items-center justify-center cursor-pointer gap-2",
                "hover:border-primary hover:bg-primary/5 transition-all",
                uploadingPhoto && "opacity-50 pointer-events-none"
              )}>
                <Upload className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {uploadingPhoto ? 'Uploading...' : 'Upload'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handlePhotoUpload(e.target.files)}
                  disabled={uploadingPhoto}
                />
              </label>
            </div>
          ) : (
            <InlineCameraCapture
              enableOCR
              onCapture={(file, data) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                  const newPhotos = [...extras.photos, e.target?.result as string];
                  handleUpdate('photos', newPhotos);
                  
                  // If OCR detected text, add to notes
                  if (data?.text) {
                    const currentNotes = extras.notes || '';
                    const ocrNote = `\n\nFrom photo: ${data.text}`;
                    handleUpdate('notes', currentNotes + ocrNote);
                  }
                  
                  setShowCamera(false);
                };
                reader.readAsDataURL(file);
              }}
              onCancel={() => setShowCamera(false)}
            />
          )}
        </Card>

        {/* Common Notes Chips */}
        <Card className="p-6 space-y-4">
          <div>
            <h3 className="font-semibold text-foreground">Quick Notes</h3>
            <p className="text-sm text-muted-foreground">
              Tap to add common requirements to your notes
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {COMMON_NOTES.map((note) => {
              const isSelected = extras.notes?.includes(note);
              return (
                <Badge
                  key={note}
                  variant={isSelected ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer px-4 py-2 transition-all",
                    isSelected ? "bg-primary text-white border-primary" : "hover:border-primary"
                  )}
                  onClick={() => toggleNoteChip(note)}
                >
                  {note}
                </Badge>
              );
            })}
          </div>
        </Card>

        {/* Additional Notes */}
        <Card className="p-6 space-y-3">
          <h3 className="font-semibold text-foreground">Additional Notes</h3>
          <Textarea
            value={extras.notes || ''}
            onChange={(e) => handleUpdate('notes', e.target.value)}
            placeholder="Any other details professionals should know..."
            rows={4}
          />
        </Card>

        {/* Permits/Compliance */}
        <Card className="p-6 space-y-3">
          <h3 className="font-semibold text-foreground">Permits & Compliance</h3>
          <p className="text-sm text-muted-foreground">
            Are there any permits, HOA rules, or compliance requirements for this work?
          </p>
          <div className="flex gap-3">
            <Badge
              variant={extras.permitsConcern === false ? "default" : "outline"}
              className={cn(
                "cursor-pointer px-6 py-2 transition-all",
                extras.permitsConcern === false ? "bg-primary text-white border-primary" : "hover:border-primary"
              )}
              onClick={() => handleUpdate('permitsConcern', false)}
            >
              No, I don't think so
            </Badge>
            <Badge
              variant={extras.permitsConcern === true ? "default" : "outline"}
              className={cn(
                "cursor-pointer px-6 py-2 transition-all",
                extras.permitsConcern === true ? "bg-primary text-white border-primary" : "hover:border-primary"
              )}
              onClick={() => handleUpdate('permitsConcern', true)}
            >
              Yes, we can discuss
            </Badge>
          </div>
        </Card>
      </div>

      <div className="flex justify-end pt-6">
        <Button
          size="lg"
          onClick={onNext}
          className="bg-gradient-hero text-white px-8"
        >
          Continue to Review
        </Button>
      </div>
    </div>
  );
};
