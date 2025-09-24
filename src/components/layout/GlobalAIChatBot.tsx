import React from 'react';
import { AIChatBot } from '@/components/ai/AIChatBot';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const GlobalAIChatBot = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Don't show on certain pages
  const hiddenPaths = ['/auth', '/signin', '/signup'];
  const shouldHide = hiddenPaths.some(path => location.pathname.startsWith(path));

  if (shouldHide) return null;

  // Determine context based on current route
  const getContext = () => {
    const path = location.pathname;
    const context: any = {
      page: path,
      user_role: user?.user_metadata?.role || 'client'
    };

    // Add specific context based on route
    if (path.includes('/job/')) {
      const jobId = path.split('/job/')[1];
      context.job_id = jobId;
    }

    if (path.includes('/dashboard')) {
      context.page = 'dashboard';
    }

    if (path.includes('/services')) {
      context.page = 'services';
    }

    if (path.includes('/professionals')) {
      context.page = 'professionals';
    }

    return context;
  };

  return (
    <AIChatBot 
      context={getContext()}
      className="z-[9999]"
    />
  );
};