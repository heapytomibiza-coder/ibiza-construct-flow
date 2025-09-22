export interface Question {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'slider' | 'file';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  allowOther?: boolean;
  showIf?: (answers: Record<string, any>) => boolean;
  min?: number;
  max?: number;
  step?: number;
  accept?: string; // for file inputs
}

export const generalQuestions: Question[] = [
  {
    id: 'title',
    type: 'text',
    label: 'What would you like to call this job?',
    placeholder: 'e.g. Fix leaky kitchen faucet',
    required: true,
  },
  {
    id: 'description',
    type: 'textarea',
    label: 'Describe what you need done',
    placeholder: 'Please provide details about the work needed, location, any specific requirements...',
    required: true,
  },
  {
    id: 'address_area',
    type: 'radio',
    label: 'Where is this job located?',
    required: true,
    allowOther: true,
    options: [
      'Ibiza Town',
      'San Antonio',
      'Santa Eulària',
      'Sant Josep',
      'Sant Joan',
      'Other'
    ],
  },
  {
    id: 'parking',
    type: 'radio',
    label: 'What\'s the parking situation?',
    required: true,
    options: [
      'Driveway available',
      'Street parking nearby',
      'No parking available',
      'Paid parking nearby'
    ],
  },
  {
    id: 'access_notes',
    type: 'radio',
    label: 'Property access',
    required: true,
    options: [
      'Ground floor',
      'Elevator available',
      'Stairs only',
      'Gated community'
    ],
  },
  {
    id: 'preferred_timeslot',
    type: 'radio',
    label: 'When do you need this done?',
    required: true,
    options: [
      'ASAP (within 48h)',
      'This week',
      'Next 2 weeks',
      'Flexible timing'
    ],
  },
  {
    id: 'schedule_detail',
    type: 'radio',
    label: 'Preferred time of day',
    required: true,
    showIf: (answers) => answers.preferred_timeslot !== 'Flexible timing',
    options: [
      'Morning (8am-12pm)',
      'Afternoon (12pm-6pm)',
      'Evening (6pm-8pm)',
      'Weekend only'
    ],
  },
  {
    id: 'budget_band',
    type: 'select',
    label: 'Budget range (auto-suggested based on service)',
    required: true,
    options: [
      '€50 - €100',
      '€100 - €250',
      '€250 - €500',
      '€500 - €1000',
      '€1000 - €2500',
      '€2500+',
      'Need quote first'
    ],
  },
  {
    id: 'escrow_preference',
    type: 'radio',
    label: 'Use secure payment escrow?',
    required: true,
    options: [
      'Yes, hold payment until completion',
      'No, direct payment preferred'
    ],
  },
  {
    id: 'contact_method',
    type: 'radio',
    label: 'Preferred contact method',
    required: true,
    options: [
      'WhatsApp',
      'Phone call',
      'Email only'
    ],
  },
  {
    id: 'photos',
    type: 'file',
    label: 'Add photos to help explain the job (optional)',
    accept: 'image/*',
  },
];