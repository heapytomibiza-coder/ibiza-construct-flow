import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { updateMetadata, PageMetadata, defaultMetadata } from '@/lib/seo/metadata';

/**
 * Hook to manage page metadata dynamically
 */
export function usePageMetadata(metadata?: Partial<PageMetadata>) {
  const location = useLocation();

  useEffect(() => {
    const fullMetadata: PageMetadata = {
      ...defaultMetadata,
      ...metadata,
      url: `${window.location.origin}${location.pathname}`,
    };

    updateMetadata(fullMetadata);
  }, [location.pathname, metadata]);
}
