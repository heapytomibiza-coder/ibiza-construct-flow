import { useState, useEffect } from 'react';

interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpg' | 'png';
}

export function useImageOptimization(
  originalUrl: string,
  options: ImageOptimizationOptions = {}
) {
  const [optimizedUrl, setOptimizedUrl] = useState<string>(originalUrl);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  useEffect(() => {
    // Check if browser supports WebP or AVIF
    const checkFormat = async () => {
      if (options.format === 'webp') {
        const webpSupport = await supportsWebP();
        setIsSupported(webpSupport);
      } else if (options.format === 'avif') {
        const avifSupport = await supportsAVIF();
        setIsSupported(avifSupport);
      }
    };

    checkFormat();

    // If Supabase Storage URL, add transformation parameters
    if (originalUrl.includes('supabase.co/storage')) {
      const url = new URL(originalUrl);
      const params = new URLSearchParams();

      if (options.width) params.append('width', options.width.toString());
      if (options.height) params.append('height', options.height.toString());
      if (options.quality) params.append('quality', options.quality.toString());
      if (options.format && isSupported) params.append('format', options.format);

      if (params.toString()) {
        url.search = params.toString();
        setOptimizedUrl(url.toString());
      }
    }
  }, [originalUrl, options, isSupported]);

  return optimizedUrl;
}

async function supportsWebP(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  const elem = document.createElement('canvas');
  if (elem.getContext && elem.getContext('2d')) {
    return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  return false;
}

async function supportsAVIF(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  return new Promise((resolve) => {
    const avif = new Image();
    avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
    avif.onload = () => resolve(true);
    avif.onerror = () => resolve(false);
  });
}

export function generateSrcSet(
  baseUrl: string,
  widths: number[] = [320, 640, 960, 1280, 1920]
): string {
  return widths
    .map((width) => {
      const url = new URL(baseUrl);
      url.searchParams.append('width', width.toString());
      return `${url.toString()} ${width}w`;
    })
    .join(', ');
}
