/**
 * /post route - Direct launch into Canonical Job Wizard
 * No landing page - wizard starts immediately
 */
import React from 'react';
import { CanonicalJobWizard } from '@/components/wizard/canonical/CanonicalJobWizard';

const PostJob: React.FC = () => {
  return <CanonicalJobWizard />;
};

export default PostJob;