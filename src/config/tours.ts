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
 * Job Wizard Tour (7 steps)
 * Guides users through the smart job posting wizard
 */
export const jobWizardTourSteps: TourStep[] = [
  {
    target: '#job-wizard-root',
    title: 'Smart Job Posting Wizard',
    description: 'This intelligent wizard asks the right questions so professionals can provide accurate quotes the first time - no back-and-forth needed.',
    placement: 'bottom',
  },
  {
    target: '#wizard-step-category',
    title: 'Step 1: Choose Main Category',
    description: 'Start by selecting the primary type of work: Construction, Painting, HVAC, Cleaning, Gardening, or Specialized services.',
    placement: 'right',
  },
  {
    target: '#wizard-step-subcategory',
    title: 'Step 2: Select Specific Service',
    description: 'Narrow down to the exact service you need. For example: Roofing, Exterior Painting, Pool Maintenance, Kitchen Renovation, etc.',
    placement: 'right',
  },
  {
    target: '#wizard-step-micro',
    title: 'Step 3: Choose Micro-Service',
    description: 'Select the precise task or combination of tasks. You can choose multiple related services for a complete quote.',
    placement: 'right',
  },
  {
    target: '#wizard-step-questions',
    title: 'Step 4: Answer Smart Questions',
    description: 'These questions adapt to your selections and capture all details professionals need: site conditions, access, materials, timeline, and expectations.',
    placement: 'left',
  },
  {
    target: '#wizard-step-logistics',
    title: 'Step 5: Location & Timing',
    description: 'Tell us where on the island the work is located and your preferred timeline. This helps match you with available professionals.',
    placement: 'top',
  },
  {
    target: '#wizard-step-review',
    title: 'Step 6: Review & Submit',
    description: 'Review all details, add photos or additional notes, then submit. Verified professionals will be notified immediately and can send structured quotes.',
    placement: 'top',
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
