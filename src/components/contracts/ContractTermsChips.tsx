import { Clock, Calendar, Shield, CreditCard } from 'lucide-react';
import { QuickSelectionChips } from '@/components/services/QuickSelectionChips';

interface ContractTermsChipsProps {
  selectedOptions: string[];
  onSelectionChange: (options: string[]) => void;
}

export const PaymentTermsChips = ({ selectedOptions, onSelectionChange }: ContractTermsChipsProps) => {
  const paymentOptions = [
    { id: 'upfront-full', label: 'Full Payment Upfront', icon: <CreditCard className="w-4 h-4" />, popular: true },
    { id: 'upfront-50', label: '50% Upfront, 50% Complete', icon: <CreditCard className="w-4 h-4" />, popular: true },
    { id: 'milestone', label: 'Milestone Payments', icon: <Shield className="w-4 h-4" /> },
    { id: 'completion', label: 'Payment on Completion', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'escrow', label: 'Escrow Protected', icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <QuickSelectionChips
      title="Payment Terms"
      subtitle="How would you like to handle payments?"
      options={paymentOptions}
      selectedOptions={selectedOptions}
      onSelectionChange={onSelectionChange}
      multiSelect={false}
    />
  );
};

export const TimelineChips = ({ selectedOptions, onSelectionChange }: ContractTermsChipsProps) => {
  const timelineOptions = [
    { id: 'asap', label: 'Start ASAP', icon: <Clock className="w-4 h-4" />, popular: true },
    { id: 'this-week', label: 'This Week', icon: <Calendar className="w-4 h-4" />, popular: true },
    { id: 'next-week', label: 'Next Week', icon: <Calendar className="w-4 h-4" /> },
    { id: 'flexible', label: 'Flexible Start', icon: <Clock className="w-4 h-4" /> },
    { id: 'specific-date', label: 'Specific Date', icon: <Calendar className="w-4 h-4" /> },
  ];

  return (
    <QuickSelectionChips
      title="Project Timeline"
      subtitle="When should the work begin?"
      options={timelineOptions}
      selectedOptions={selectedOptions}
      onSelectionChange={onSelectionChange}
      multiSelect={false}
    />
  );
};

export const ProtectionChips = ({ selectedOptions, onSelectionChange }: ContractTermsChipsProps) => {
  const protectionOptions = [
    { id: 'insurance', label: 'Insured Professional', icon: <Shield className="w-4 h-4" />, popular: true },
    { id: 'guarantee', label: 'Work Guarantee', icon: <Shield className="w-4 h-4" />, popular: true },
    { id: 'disputes', label: 'Dispute Resolution', icon: <Shield className="w-4 h-4" /> },
    { id: 'materials', label: 'Materials Covered', icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <QuickSelectionChips
      title="Protection & Guarantees"
      subtitle="What protections do you want included?"
      options={protectionOptions}
      selectedOptions={selectedOptions}
      onSelectionChange={onSelectionChange}
      multiSelect={true}
    />
  );
};