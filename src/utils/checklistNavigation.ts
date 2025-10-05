import { OnboardingStep } from '@/hooks/useOnboardingChecklist';

export const getChecklistStepUrl = (step: OnboardingStep): string => {
  const urls: Record<OnboardingStep, string> = {
    profile_basic: '/onboarding/professional',
    verification: '/professional/verification',
    services: '/professional/services',
    availability: '/onboarding/professional', // Embedded in onboarding
    portfolio: '/professional/portfolio',
    payment_setup: '/professional/payout'
  };
  return urls[step];
};

export const getStepConfig = (step: OnboardingStep) => {
  const configs: Record<OnboardingStep, {
    title: string;
    description: string;
    icon: string;
    estimatedTime: string;
    priority: 'critical' | 'important' | 'optional';
  }> = {
    profile_basic: {
      title: 'Complete Your Profile',
      description: 'Add your basic information, skills, and bio',
      icon: 'User',
      estimatedTime: '5 min',
      priority: 'critical'
    },
    verification: {
      title: 'Verify Your Identity',
      description: 'Submit documents for identity verification',
      icon: 'ShieldCheck',
      estimatedTime: '10 min',
      priority: 'critical'
    },
    services: {
      title: 'Add Your Services',
      description: 'List the services you offer and pricing',
      icon: 'Briefcase',
      estimatedTime: '15 min',
      priority: 'important'
    },
    availability: {
      title: 'Set Availability',
      description: 'Configure your working hours and schedule',
      icon: 'Calendar',
      estimatedTime: '5 min',
      priority: 'important'
    },
    portfolio: {
      title: 'Build Your Portfolio',
      description: 'Showcase your work with photos and descriptions',
      icon: 'Images',
      estimatedTime: '20 min',
      priority: 'important'
    },
    payment_setup: {
      title: 'Setup Payment Method',
      description: 'Configure how you receive payments',
      icon: 'CreditCard',
      estimatedTime: '10 min',
      priority: 'optional'
    }
  };
  return configs[step];
};

export const getProgressBadge = (percentage: number): {
  text: string;
  color: string;
} => {
  if (percentage === 0) {
    return { text: "Let's Get Started!", color: 'text-muted-foreground' };
  } else if (percentage < 50) {
    return { text: `${percentage}% Complete - Keep Going!`, color: 'text-blue-500' };
  } else if (percentage < 100) {
    return { text: `${percentage}% Complete - Almost There!`, color: 'text-orange-500' };
  } else {
    return { text: 'Profile Complete! 🎉', color: 'text-green-500' };
  }
};
