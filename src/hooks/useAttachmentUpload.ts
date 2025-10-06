import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AttachmentUploadResult {
  success: boolean;
  url?: string;
  path?: string;
  thumbnailUrl?: string;
  metadata?: {
    id: string;
    file_name: string;
    file_size: number;
    mime_type: string;
  };
}

const ALLOWED_MIME_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

const MAX_FILE_SIZE = {
  image: 5 * 1024 * 1024, // 5MB
  document: 10 * 1024 * 1024 // 10MB
};

export function useAttachmentUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    const allAllowedTypes = [...ALLOWED_MIME_TYPES.images, ...ALLOWED_MIME_TYPES.documents];
    
    if (!allAllowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not supported. Please upload images (JPG, PNG, GIF, WebP) or documents (PDF, DOC, DOCX).' };
    }

    const isImage = ALLOWED_MIME_TYPES.images.includes(file.type);
    const maxSize = isImage ? MAX_FILE_SIZE.image : MAX_FILE_SIZE.document;
    
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      return { valid: false, error: `File too large. Maximum size is ${maxSizeMB}MB for ${isImage ? 'images' : 'documents'}.` };
    }

    return { valid: true };
  }, []);

  const uploadAttachment = useCallback(async (
    file: File,
    messageId?: string
  ): Promise<AttachmentUploadResult> => {
    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return { success: false };
    }

    setUploading(true);
    setProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to storage
      const client: any = supabase;
      const { data: uploadData, error: uploadError } = await client.storage
        .from('message-attachments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error('Failed to upload file');
        return { success: false };
      }

      setProgress(50);

      // Get public URL
      const { data: urlData } = client.storage
        .from('message-attachments')
        .getPublicUrl(filePath);

      setProgress(75);

      // Generate thumbnail for images
      let thumbnailPath = null;
      if (ALLOWED_MIME_TYPES.images.includes(file.type)) {
        // In production, you'd use an image processing service
        // For now, we'll use the same URL
        thumbnailPath = filePath;
      }

      // Create metadata record if messageId provided
      let metadataId;
      if (messageId) {
        const { data: metadataData, error: metadataError } = await client
          .from('message_attachment_metadata')
          .insert({
            message_id: messageId,
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type,
            storage_path: filePath,
            thumbnail_path: thumbnailPath
          })
          .select()
          .single();

        if (metadataError) {
          console.error('Metadata error:', metadataError);
        } else {
          metadataId = metadataData.id;
        }
      }

      setProgress(100);
      toast.success('File uploaded successfully');

      return {
        success: true,
        url: urlData.publicUrl,
        path: filePath,
        thumbnailUrl: thumbnailPath ? urlData.publicUrl : undefined,
        metadata: metadataId ? {
          id: metadataId,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type
        } : undefined
      };
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
      return { success: false };
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [validateFile]);

  const deleteAttachment = useCallback(async (filePath: string) => {
    const client: any = supabase;
    const { error } = await client.storage
      .from('message-attachments')
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete file');
      return false;
    }

    return true;
  }, []);

  return {
    uploading,
    progress,
    uploadAttachment,
    deleteAttachment,
    validateFile
  };
}
