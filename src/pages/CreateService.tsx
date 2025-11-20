/**
 * /services/new route - Direct launch into Professional Service Creation Wizard
 */
import React from 'react';
import { ProfessionalServiceWizard } from '@/components/wizard/professional/ProfessionalServiceWizard';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

const CreateService: React.FC = () => {
  console.log('🎯 CreateService page rendering');
  
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('🚨 CreateService Error Boundary caught error:', error, errorInfo);
      }}
    >
      <ProfessionalServiceWizard />
    </ErrorBoundary>
  );
};

export default CreateService;
