import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  Calendar,
  Camera,
  Target,
  TrendingUp
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { ExtendedMessageType } from '@/types/messaging';

interface StructuredMessageCardProps {
  type: ExtendedMessageType;
  metadata?: Record<string, any>;
  content: string;
}

const messageTypeConfig = {
  quote_sent: {
    icon: FileText,
    label: 'Quote Sent',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
  },
  quote_updated: {
    icon: TrendingUp,
    label: 'Quote Updated',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
  },
  quote_accepted: {
    icon: CheckCircle,
    label: 'Quote Accepted',
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
  },
  quote_rejected: {
    icon: XCircle,
    label: 'Quote Declined',
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
  },
  deposit_request: {
    icon: DollarSign,
    label: 'Deposit Requested',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 border-amber-200',
  },
  payment_received: {
    icon: CheckCircle,
    label: 'Payment Received',
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
  },
  work_complete_request: {
    icon: Target,
    label: 'Work Complete',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 border-indigo-200',
  },
  work_approved: {
    icon: CheckCircle,
    label: 'Work Approved',
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
  },
  milestone_created: {
    icon: Target,
    label: 'Milestone Created',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
  },
  milestone_completed: {
    icon: CheckCircle,
    label: 'Milestone Completed',
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
  },
  date_proposal: {
    icon: Calendar,
    label: 'Date Proposed',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
  },
  photo_request: {
    icon: Camera,
    label: 'Photos Requested',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50 border-pink-200',
  },
};

export const StructuredMessageCard = ({ 
  type, 
  metadata = {},
  content 
}: StructuredMessageCardProps) => {
  const config = messageTypeConfig[type as keyof typeof messageTypeConfig];
  
  if (!config) return null;

  const Icon = config.icon;

  return (
    <Card className={`p-4 ${config.bgColor} border`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg bg-background/50 ${config.color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {config.label}
            </Badge>
          </div>
          <p className="text-sm text-foreground">{content}</p>
          {metadata.amount && (
            <p className="text-lg font-semibold text-foreground mt-2">
              €{metadata.amount.toLocaleString()}
            </p>
          )}
          {metadata.date && (
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(metadata.date).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};
