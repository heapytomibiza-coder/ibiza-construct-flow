// Image optimization utilities for better performance

export const SUPPORTED_FORMATS = ['webp', 'avif', 'jpg', 'png'] as const;
export type ImageFormat = typeof SUPPORTED_FORMATS[number];

interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: ImageFormat;
}

/**
 * Generate optimized image URL with transformations
 * Supports Supabase Storage transformations
 */
export function getOptimizedImageUrl(
  originalUrl: string,
  options: ImageOptimizationOptions = {}
): string {
  if (!originalUrl) return '';

  const {
    width,
    height,
    quality = 80,
    format = 'webp'
  } = options;

  // If it's a Supabase storage URL, add transformation parameters
  if (originalUrl.includes('supabase')) {
    const url = new URL(originalUrl);
    const params = new URLSearchParams();

    if (width) params.set('width', width.toString());
    if (height) params.set('height', height.toString());
    params.set('quality', quality.toString());
    params.set('format', format);

    url.search = params.toString();
    return url.toString();
  }

  return originalUrl;
}

/**
 * Generate responsive image srcSet
 */
export function generateSrcSet(
  originalUrl: string,
  widths: number[] = [320, 640, 768, 1024, 1280]
): string {
  return widths
    .map(width => `${getOptimizedImageUrl(originalUrl, { width })} ${width}w`)
    .join(', ');
}

/**
 * Preload critical images
 */
export function preloadImage(url: string, options: ImageOptimizationOptions = {}): void {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = getOptimizedImageUrl(url, options);
  
  if (options.format) {
    link.type = `image/${options.format}`;
  }

  document.head.appendChild(link);
}

/**
 * Lazy load images with Intersection Observer
 */
export function setupLazyLoading(): void {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.src;
        
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      }
    });
  }, {
    rootMargin: '50px'
  });

  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

/**
 * Convert bytes to human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
