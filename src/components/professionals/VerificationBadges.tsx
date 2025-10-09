import { Shield, CheckCircle, Award, FileCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface VerificationBadgesProps {
  isVerified?: boolean;
  hasInsurance?: boolean;
  isBackgroundChecked?: boolean;
  isLicensed?: boolean;
}

export const VerificationBadges = ({
  isVerified = true,
  hasInsurance = true,
  isBackgroundChecked = true,
  isLicensed = true
}: VerificationBadgesProps) => {
  const badges = [
    {
      icon: Shield,
      label: 'Identity Verified',
      description: 'ID and credentials verified by our team',
      active: isVerified,
      color: 'text-blue-500'
    },
    {
      icon: FileCheck,
      label: 'Licensed Professional',
      description: 'Valid professional license on file',
      active: isLicensed,
      color: 'text-green-500'
    },
    {
      icon: Award,
      label: 'Insured',
      description: 'Liability insurance coverage verified',
      active: hasInsurance,
      color: 'text-purple-500'
    },
    {
      icon: CheckCircle,
      label: 'Background Checked',
      description: 'Passed comprehensive background screening',
      active: isBackgroundChecked,
      color: 'text-orange-500'
    }
  ];

  const activeBadges = badges.filter(b => b.active);

  if (activeBadges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <TooltipProvider>
        {activeBadges.map((badge, index) => {
          const Icon = badge.icon;
          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border-2 border-primary/20 cursor-help hover:border-primary/40 transition-colors ${badge.color}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-medium">{badge.label}</span>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">{badge.description}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </div>
  );
};
