/**
 * /services/new route - Dynamic Professional Service Creation
 */
import React from 'react';
import { DynamicServiceBuilder } from '@/components/professional/services/DynamicServiceBuilder';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

const CreateService: React.FC = () => {
  console.log('🎯 CreateService page rendering - Dynamic Builder');
  
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('🚨 CreateService Error Boundary caught error:', error, errorInfo);
      }}
    >
      <DynamicServiceBuilder />
    </ErrorBoundary>
  );
};

export default CreateService;
