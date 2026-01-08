/**
 * /post route - Direct launch into Canonical Job Wizard
 * No landing page - wizard starts immediately
 */
import React, { useEffect } from 'react';
import { CanonicalJobWizard } from '@/components/wizard/canonical/CanonicalJobWizard';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { useTour } from '@/components/tours/InteractiveTour';
import { jobWizardTourSteps } from '@/config/tours';
import { TOURS_ENABLED } from '@/config/toursEnabled';

const PostJob: React.FC = () => {
  console.log('🎯 PostJob component rendering');
  
  const { TourComponent, startTour } = useTour('job-wizard-tour', jobWizardTourSteps);
  
  // Register tour trigger for header button
  useEffect(() => {
    if (!TOURS_ENABLED) return;

    window.dispatchEvent(
      new CustomEvent('register-tour-trigger', {
        detail: { key: 'startWizardTour', trigger: startTour },
      })
    );
  }, [startTour]);
  
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('🚨 PostJob Error Boundary caught error:', error, errorInfo);
      }}
    >
      {TourComponent}
      <CanonicalJobWizard />
    </ErrorBoundary>
  );
};

export default PostJob;