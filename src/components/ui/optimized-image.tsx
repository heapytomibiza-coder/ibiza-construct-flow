import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  blurDataURL?: string;
}

export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false,
  className,
  blurDataURL,
  ...props
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [priority]);

  // Generate WebP srcSet with fallback
  const generateWebPSrcSet = (originalSrc: string) => {
    // Check if it's already WebP
    if (originalSrc.endsWith('.webp')) return originalSrc;
    
    const basePath = originalSrc.replace(/\.[^/.]+$/, '');
    const sizes = [480, 768, 1024, 1280, 1920];
    
    return sizes.map(size => `${basePath}-${size}w.webp ${size}w`).join(', ');
  };

  const generateFallbackSrcSet = (originalSrc: string) => {
    const basePath = originalSrc.replace(/\.[^/.]+$/, '');
    const extension = originalSrc.split('.').pop();
    const sizes = [480, 768, 1024, 1280, 1920];
    
    return sizes.map(size => `${basePath}-${size}w.${extension} ${size}w`).join(', ');
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          className
        )}
        style={{ width, height }}
      >
        <span className="text-sm">Image failed to load</span>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)} ref={imgRef}>
      {/* Blur placeholder */}
      {isLoading && blurDataURL && (
        <img
          src={blurDataURL}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-sm scale-110"
          aria-hidden="true"
        />
      )}
      
      {/* Loading skeleton */}
      {isLoading && !blurDataURL && (
        <div 
          className="absolute inset-0 bg-muted animate-pulse"
          style={{ width, height }}
        />
      )}
      
      {/* Only load image when in view */}
      {isInView && (
        <picture>
          {/* WebP version for modern browsers */}
          <source
            type="image/webp"
            srcSet={generateWebPSrcSet(src)}
            sizes={sizes}
          />
          
          {/* Fallback for older browsers */}
          <source
            srcSet={generateFallbackSrcSet(src)}
            sizes={sizes}
          />
          
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? 'high' : 'auto'}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              "transition-opacity duration-500",
              isLoading ? "opacity-0" : "opacity-100",
              className
            )}
            {...props}
          />
        </picture>
      )}
    </div>
  );
};