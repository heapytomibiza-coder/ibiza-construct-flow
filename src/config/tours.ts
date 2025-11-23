/**
 * Tour System Configuration
 * Centralized tour step definitions for the interactive tour system
 */

export type TourPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TourStep {
  target: string;
  title: string;
  description: string;
  placement?: TourPlacement;
}

/**
 * Homepage Tour (5 steps)
 * Guides users through the main features of the homepage
 */
export const homepageTourSteps: TourStep[] = [
  {
    target: 'body',
    title: 'Welcome to Constructive Solutions Ibiza',
    description: 'Your premier network for finding verified professionals on the island. Let\'s take a quick tour.',
    placement: 'bottom',
  },
  {
    target: '#post-job-button',
    title: 'Post a Job',
    description: 'Click here to describe your project and receive quotes from verified local professionals within 24 hours.',
    placement: 'bottom',
  },
  {
    target: '#service-categories',
    title: 'Browse by Category',
    description: 'Or explore services by category - from construction and painting to cleaning, HVAC, gardening, and more.',
    placement: 'right',
  },
  {
    target: '#how-it-works-section',
    title: 'How It Works',
    description: 'Our simple 3-step process: Post your job → Compare quotes → Hire with SafePay escrow protection.',
    placement: 'top',
  },
  {
    target: '#professional-network-section',
    title: 'Verified Professionals',
    description: 'See example profiles showing verified credentials, insurance, certifications, and real client reviews.',
    placement: 'top',
  },
];

/**
 * Job Wizard Tour (1 step)
 * Simple welcome message for the job posting wizard
 */
export const jobWizardTourSteps: TourStep[] = [
  {
    target: 'body',
    title: 'Welcome to the Job Posting Wizard',
    description: 'Follow the steps to describe your project and receive quotes from verified professionals. The wizard will guide you through everything needed for accurate pricing.',
    placement: 'bottom',
  },
];

/**
 * Demo Quick Tour (3 steps)
 * Fast overview for live demos
 */
export const demoQuickTourSteps: TourStep[] = [
  {
    target: 'body',
    title: 'Platform Overview',
    description: 'Constructive Solutions Ibiza connects clients with verified professionals through an intelligent job posting system and SafePay escrow protection.',
    placement: 'bottom',
  },
  {
    target: '#post-job-button',
    title: 'Smart Job Wizard',
    description: 'Our AI-powered wizard extracts project requirements automatically, eliminating the need for manual quote comparisons and back-and-forth messages.',
    placement: 'bottom',
  },
  {
    target: '#professional-network-section',
    title: 'Verified Network',
    description: 'All professionals are verified with insurance, certifications, and real client reviews. SafePay escrow protects all transactions.',
    placement: 'top',
  },
];
