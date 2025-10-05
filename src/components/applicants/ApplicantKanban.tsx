import { useState } from 'react';
import { useApplicantTracking } from '@/hooks/useApplicantTracking';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Mail, Calendar, MoreVertical } from 'lucide-react';
import { BulkActionChips } from './BulkActionChips';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ApplicantKanbanProps {
  jobId: string;
}

const KANBAN_COLUMNS = [
  { id: 'applied', label: 'Applied', color: 'bg-blue-100 text-blue-900' },
  { id: 'shortlisted', label: 'Shortlisted', color: 'bg-yellow-100 text-yellow-900' },
  { id: 'interviewing', label: 'Interviewing', color: 'bg-purple-100 text-purple-900' },
  { id: 'hired', label: 'Hired', color: 'bg-green-100 text-green-900' },
];

export const ApplicantKanban = ({ jobId }: ApplicantKanbanProps) => {
  const { applicants, loading, updateApplicantStatus, bulkUpdateStatus } = useApplicantTracking(jobId);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [draggedApplicant, setDraggedApplicant] = useState<string | null>(null);
  const { toast } = useToast();

  const getApplicantsByStatus = (status: string) => {
    return applicants.filter(a => a.status === status);
  };

  const handleDragStart = (applicantId: string, e: React.DragEvent) => {
    setDraggedApplicant(applicantId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (newStatus: string) => {
    if (!draggedApplicant) return;

    try {
      await updateApplicantStatus(draggedApplicant, newStatus as any);
      toast({
        title: 'Status updated',
        description: `Applicant moved to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: 'Update failed',
        variant: 'destructive',
      });
    } finally {
      setDraggedApplicant(null);
    }
  };

  // Keyboard navigation for drag-and-drop
  const handleKeyDown = async (e: React.KeyboardEvent, applicantId: string, currentStatus: string) => {
    const statusIndex = KANBAN_COLUMNS.findIndex(col => col.id === currentStatus);
    
    if (e.key === 'ArrowRight' && statusIndex < KANBAN_COLUMNS.length - 1) {
      e.preventDefault();
      const nextStatus = KANBAN_COLUMNS[statusIndex + 1].id;
      await updateApplicantStatus(applicantId, nextStatus as any);
      toast({ title: 'Status updated', description: `Moved to ${nextStatus}` });
    } else if (e.key === 'ArrowLeft' && statusIndex > 0) {
      e.preventDefault();
      const prevStatus = KANBAN_COLUMNS[statusIndex - 1].id;
      await updateApplicantStatus(applicantId, prevStatus as any);
      toast({ title: 'Status updated', description: `Moved to ${prevStatus}` });
    }
  };

  const toggleSelection = (applicantId: string) => {
    setSelectedIds(prev =>
      prev.includes(applicantId)
        ? prev.filter(id => id !== applicantId)
        : [...prev, applicantId]
    );
  };

  const handleBulkAction = async (action: string, note?: string) => {
    if (selectedIds.length === 0) return;

    try {
      await bulkUpdateStatus(selectedIds, action as any);
      toast({
        title: 'Bulk action complete',
        description: `${selectedIds.length} applicants updated`,
      });
      setSelectedIds([]);
    } catch (error) {
      toast({
        title: 'Bulk action failed',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading applicants...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk actions */}
      {selectedIds.length > 0 && (
        <BulkActionChips
          selectedCount={selectedIds.length}
          onAction={handleBulkAction}
          onClear={() => setSelectedIds([])}
        />
      )}

      {/* Kanban board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {KANBAN_COLUMNS.map(column => (
          <div
            key={column.id}
            className="space-y-3"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.id)}
          >
            {/* Column header */}
            <div className={cn("p-3 rounded-lg", column.color)}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{column.label}</h3>
                <Badge variant="secondary" className="bg-white/50">
                  {getApplicantsByStatus(column.id).length}
                </Badge>
              </div>
            </div>

            {/* Applicant cards */}
            <div className="space-y-2 min-h-[200px]">
              {getApplicantsByStatus(column.id).map(applicant => (
                <Card
                  key={applicant.id}
                  draggable
                  onDragStart={(e) => handleDragStart(applicant.id, e)}
                  onKeyDown={(e) => handleKeyDown(e, applicant.id, column.id)}
                  tabIndex={0}
                  role="button"
                  aria-label={`${applicant.professional?.full_name || 'Professional'} - ${column.label}. Press arrow keys to move between columns.`}
                  className={cn(
                    "p-4 cursor-move hover:shadow-md transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[44px]",
                    selectedIds.includes(applicant.id) && "ring-2 ring-primary",
                    draggedApplicant === applicant.id && "opacity-50"
                  )}
                  onClick={() => toggleSelection(applicant.id)}
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={applicant.professional?.avatar_url || undefined} />
                        <AvatarFallback>
                          {applicant.professional?.full_name?.[0] || 'P'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {applicant.professional?.full_name || 'Professional'}
                        </p>
                        {applicant.rating && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{applicant.rating}/5</span>
                          </div>
                        )}
                      </div>

                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Tags */}
                    {applicant.tags && applicant.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {applicant.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex-1 h-auto min-h-[44px] focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={`Send message to ${applicant.professional?.full_name || 'Professional'}`}
                      >
                        <Mail className="w-3 h-3 mr-1" aria-hidden="true" />
                        Message
                      </Button>
                      {applicant.interview_scheduled_at && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1 h-auto min-h-[44px] focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label="View interview details"
                        >
                          <Calendar className="w-3 h-3 mr-1" aria-hidden="true" />
                          Interview
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
