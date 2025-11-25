import { Button } from '@/components/ui/button';
import { 
  FileText, 
  DollarSign, 
  Calendar, 
  Camera, 
  CheckCircle 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ChatActionBarProps {
  conversationId: string;
  jobId: string | null;
  contractStatus?: 'pending' | 'quoted' | 'in_progress' | 'completed' | 'cancelled';
  userRole: 'client' | 'professional';
  onSendStructuredMessage: (type: string, content: string, metadata?: any) => void;
}

export const ChatActionBar = ({
  conversationId,
  jobId,
  contractStatus = 'pending',
  userRole,
  onSendStructuredMessage,
}: ChatActionBarProps) => {
  const navigate = useNavigate();
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);

  if (!jobId) return null;

  const isProfessional = userRole === 'professional';
  const canSendQuote = isProfessional && (contractStatus === 'pending' || contractStatus === 'quoted');
  const canRequestDeposit = isProfessional && contractStatus === 'quoted';
  const canMarkComplete = isProfessional && contractStatus === 'in_progress';

  const actions = [
    {
      show: canSendQuote,
      icon: FileText,
      label: 'Send Quote',
      onClick: () => navigate(`/quotes/create?job=${jobId}`),
    },
    {
      show: canRequestDeposit,
      icon: DollarSign,
      label: 'Request Deposit',
      onClick: () => {
        onSendStructuredMessage(
          'deposit_request',
          'I would like to request a deposit to begin work.',
          { job_id: jobId }
        );
      },
    },
    {
      show: true,
      icon: Calendar,
      label: 'Propose Date',
      onClick: () => {
        onSendStructuredMessage(
          'date_proposal',
          'I would like to propose a new date for this work.',
          { job_id: jobId }
        );
      },
    },
    {
      show: true,
      icon: Camera,
      label: 'Request Photos',
      onClick: () => {
        onSendStructuredMessage(
          'photo_request',
          'Could you please share some photos?',
          { job_id: jobId }
        );
      },
    },
    {
      show: canMarkComplete,
      icon: CheckCircle,
      label: 'Mark Complete',
      onClick: () => {
        onSendStructuredMessage(
          'work_complete_request',
          'I have completed the work. Please review and approve.',
          { job_id: jobId }
        );
      },
    },
  ].filter(action => action.show);

  if (actions.length === 0) return null;

  return (
    <div className="border-t bg-muted/30 px-4 py-2">
      <div className="flex items-center gap-2 overflow-x-auto">
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          Quick actions:
        </span>
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={action.onClick}
              className="whitespace-nowrap"
            >
              <Icon className="w-3 h-3 mr-1" />
              {action.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
