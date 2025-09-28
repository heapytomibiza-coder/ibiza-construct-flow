import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PostJobView from '@/components/client/PostJobView';
import { useMarketplaceContext } from '@/hooks/useMarketplaceContext';

const PostJob: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { context, updateContext } = useMarketplaceContext();

  // Handle URL params from marketplace context
  useEffect(() => {
    const service = searchParams.get('service');
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const budget = searchParams.get('budget');
    
    // Update context with URL params
    updateContext({
      searchTerm: service || context.searchTerm,
      category: category || context.category,
      location: location ? { lat: 0, lng: 0, address: location } : context.location,
      budget: budget as any || context.budget,
      currentPath: 'post'
    });
  }, [searchParams, updateContext, context]);

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