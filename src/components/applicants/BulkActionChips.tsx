import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DECLINE_REASONS } from '@/lib/ibiza-defaults';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Mail, Star, UserX, Calendar } from 'lucide-react';

interface BulkActionChipsProps {
  selectedCount: number;
  onAction: (action: string, note?: string) => void;
  onClear: () => void;
}

export const BulkActionChips = ({ selectedCount, onAction, onClear }: BulkActionChipsProps) => {
  const { i18n } = useTranslation();
  const [showDeclineReasons, setShowDeclineReasons] = useState(false);
  const locale = i18n.language as 'en' | 'es';
  const declineReasons = DECLINE_REASONS[locale];

  const handleDecline = (reason: string) => {
    onAction('declined', reason);
    setShowDeclineReasons(false);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-3 p-4 rounded-2xl border-2 border-primary bg-card shadow-2xl">
        {/* Selection count */}
        <div className="flex items-center gap-2">
          <Badge variant="default" className="h-8 px-3 text-base">
            {selectedCount} selected
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClear}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="w-px h-8 bg-border" />

        {/* Quick actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction('invited')}
            className="h-9"
          >
            <Mail className="w-4 h-4 mr-2" />
            Invite
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction('shortlisted')}
            className="h-9"
          >
            <Star className="w-4 h-4 mr-2" />
            Shortlist
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction('interviewing')}
            className="h-9"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Interview
          </Button>

          {/* Decline with preset reasons */}
          {!showDeclineReasons ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeclineReasons(true)}
              className="h-9 text-destructive hover:text-destructive"
            >
              <UserX className="w-4 h-4 mr-2" />
              Decline
            </Button>
          ) : (
            <Select onValueChange={handleDecline}>
              <SelectTrigger className="h-9 w-[200px]">
                <SelectValue placeholder="Select reason..." />
              </SelectTrigger>
              <SelectContent>
                {declineReasons.map((reason, index) => (
                  <SelectItem key={index} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </div>
  );
};
