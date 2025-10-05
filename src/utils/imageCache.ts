/**
 * Image caching utilities for optimizing attachment loading
 * Implements lazy loading and thumbnail caching strategies
 */

// Cache for thumbnail URLs to avoid duplicate requests
const thumbnailCache = new Map<string, string>();

// Cache for full resolution images
const fullImageCache = new Map<string, string>();

/**
 * Generate thumbnail URL from Supabase storage URL
 * Uses Supabase's image transformation API
 */
export const getThumbnailUrl = (
  fullUrl: string, 
  width: number = 200, 
  height: number = 200
): string => {
  const cacheKey = `${fullUrl}-${width}x${height}`;
  
  if (thumbnailCache.has(cacheKey)) {
    return thumbnailCache.get(cacheKey)!;
  }

  // For Supabase storage URLs, use transform API
  if (fullUrl.includes('supabase')) {
    const url = new URL(fullUrl);
    url.searchParams.set('width', width.toString());
    url.searchParams.set('height', height.toString());
    url.searchParams.set('resize', 'cover');
    url.searchParams.set('quality', '80');
    
    const thumbnailUrl = url.toString();
    thumbnailCache.set(cacheKey, thumbnailUrl);
    return thumbnailUrl;
  }

  // For other URLs, return as-is
  return fullUrl;
};

/**
 * Preload image to cache
 */
export const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (fullImageCache.has(url)) {
      resolve();
      return;
    }

    const img = new Image();
    img.onload = () => {
      fullImageCache.set(url, url);
      resolve();
    };
    img.onerror = reject;
    img.src = url;
  });
};

/**
 * Lazy load image with intersection observer
 */
export const lazyLoadImage = (
  imgElement: HTMLImageElement,
  src: string,
  thumbnailSrc?: string
) => {
  // Show thumbnail immediately if available
  if (thumbnailSrc) {
    imgElement.src = thumbnailSrc;
  }

  // Use intersection observer for lazy loading
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Load full resolution when in viewport
          preloadImage(src)
            .then(() => {
              imgElement.src = src;
              imgElement.classList.add('loaded');
            })
            .catch((err) => {
              console.error('Failed to load image:', err);
            });
          
          observer.unobserve(imgElement);
        }
      });
    },
    {
      rootMargin: '50px', // Start loading 50px before entering viewport
      threshold: 0.01,
    }
  );

  observer.observe(imgElement);

  // Cleanup function
  return () => observer.unobserve(imgElement);
};

/**
 * Clear thumbnail cache (useful for memory management)
 */
export const clearThumbnailCache = () => {
  thumbnailCache.clear();
};

/**
 * Clear full image cache
 */
export const clearFullImageCache = () => {
  fullImageCache.clear();
};

/**
 * Get cache size for monitoring
 */
export const getCacheStats = () => {
  return {
    thumbnails: thumbnailCache.size,
    fullImages: fullImageCache.size,
  };
};

/**
 * Batch preload multiple images
 */
export const batchPreloadImages = async (urls: string[]): Promise<void[]> => {
  return Promise.all(urls.map(url => preloadImage(url)));
};

/**
 * React hook for lazy image loading
 */
export const useLazyImage = () => {
  return {
    getThumbnailUrl,
    preloadImage,
    lazyLoadImage,
    batchPreloadImages,
  };
};
