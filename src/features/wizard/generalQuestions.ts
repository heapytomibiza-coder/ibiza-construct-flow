export interface Question {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'slider' | 'file';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
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
    id: 'urgency',
    type: 'radio',
    label: 'How urgent is this job?',
    required: true,
    options: [
      'ASAP (Emergency)',
      'Within 24 hours',
      'Within a week',
      'Within a month',
      'Flexible timing'
    ],
  },
  {
    id: 'budget',
    type: 'select',
    label: 'What\'s your budget range?',
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
    id: 'property_type',
    type: 'radio',
    label: 'What type of property is this?',
    required: true,
    options: [
      'Apartment/Flat',
      'House',
      'Villa',
      'Commercial',
      'Other'
    ],
  },
  {
    id: 'access',
    type: 'checkbox',
    label: 'Access considerations (check all that apply)',
    options: [
      'Easy street parking',
      'Parking permit needed',
      'Stairs/No elevator',
      'Narrow doorways',
      'Tools/materials need to be carried far',
      'Special access arrangements needed'
    ],
  },
  {
    id: 'photos',
    type: 'file',
    label: 'Add photos to help explain the job (optional)',
    accept: 'image/*',
  },
];