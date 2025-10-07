/**
 * /post route - Direct launch into Canonical Job Wizard
 * No landing page - wizard starts immediately
 */
import React from 'react';
import { CanonicalJobWizard } from '@/components/wizard/canonical/CanonicalJobWizard';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

const PostJob: React.FC = () => {
  console.log('🎯 PostJob component rendering');
  
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('🚨 PostJob Error Boundary caught error:', error, errorInfo);
      }}
    >
      <CanonicalJobWizard />
    </ErrorBoundary>
  );
};

export default PostJob;