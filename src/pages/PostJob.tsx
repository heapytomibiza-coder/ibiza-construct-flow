import React, { useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PostJobView from '@/components/client/PostJobView';
import { useMarketplaceContext } from '@/hooks/useMarketplaceContext';

const PostJob: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { context, updateContext } = useMarketplaceContext();

  // Extract params once to prevent re-renders
  const urlParams = useMemo(() => ({
    service: searchParams.get('service'),
    category: searchParams.get('category'),
    location: searchParams.get('location'),
    budget: searchParams.get('budget')
  }), [searchParams]);

  // Handle URL params from marketplace context
  useEffect(() => {
    // Only update if there are actual URL params to process
    if (!urlParams.service && !urlParams.category && !urlParams.location && !urlParams.budget) {
      // Just ensure currentPath is set
      if (context.currentPath !== 'post') {
        updateContext({ currentPath: 'post' });
      }
      return;
    }

    // Build updates only for params that exist
    const updates: any = { currentPath: 'post' };
    
    if (urlParams.service) updates.searchTerm = urlParams.service;
    if (urlParams.category) updates.category = urlParams.category;
    if (urlParams.location) {
      updates.location = { lat: 0, lng: 0, address: urlParams.location };
    }
    if (urlParams.budget) updates.budget = urlParams.budget;
    
    updateContext(updates);
  }, [urlParams, updateContext]);

  const handleCrossoverToDiscovery = () => {
    updateContext({
      previousPath: 'post',
      crossoverCount: (context.crossoverCount || 0) + 1
    });
    
    const discoveryUrl = `/discovery?${new URLSearchParams({
      ...(context.searchTerm && { q: context.searchTerm }),
      ...(context.category && { category: context.category }),
      ...(context.location?.address && { location: context.location.address })
    }).toString()}`;
    
    navigate(discoveryUrl);
  };

  return <PostJobView />;
};

export default PostJob;