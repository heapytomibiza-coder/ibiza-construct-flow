import { FileText, Download, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AttachmentPreviewProps {
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize?: number;
  thumbnailUrl?: string;
  className?: string;
}

export function AttachmentPreview({
  fileName,
  fileUrl,
  mimeType,
  fileSize,
  thumbnailUrl,
  className
}: AttachmentPreviewProps) {
  const isImage = mimeType.startsWith('image/');
  const displayUrl = thumbnailUrl || fileUrl;

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${mb.toFixed(1)} MB`;
  };

  const handleDownload = () => {
    window.open(fileUrl, '_blank');
  };

  return (
    <div className={cn('group relative rounded-lg border bg-card overflow-hidden', className)}>
      {isImage ? (
        <div className="aspect-video relative">
          <img
            src={displayUrl}
            alt={fileName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleDownload}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4 flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded bg-muted flex items-center justify-center">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{fileName}</p>
            {fileSize && (
              <p className="text-xs text-muted-foreground">{formatFileSize(fileSize)}</p>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDownload}
            className="flex-shrink-0"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
