import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: Array<{ id: number; label?: string }>;
  columns?: 2 | 3 | 4;
  className?: string;
}

export const ImageGallery = ({ images, columns = 3, className }: ImageGalleryProps) => {
  return (
    <div
      className={cn(
        "grid gap-4",
        columns === 2 && "grid-cols-2",
        columns === 3 && "grid-cols-3",
        columns === 4 && "grid-cols-4",
        className
      )}
    >
      {images.map((image) => (
        <div
          key={image.id}
          className="relative aspect-video rounded-lg overflow-hidden border border-sage-muted/30 bg-gradient-to-br from-sage/20 to-copper/20 group hover:scale-105 transition-transform"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          {image.label && (
            <div className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              {image.label}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
