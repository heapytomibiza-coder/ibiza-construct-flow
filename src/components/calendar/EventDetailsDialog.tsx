import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarEvent } from '@/hooks/useCalendarEvents';
import { format } from 'date-fns';
import { Trash2, Edit } from 'lucide-react';

interface EventDetailsDialogProps {
  event: CalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (eventId: string, updates: Partial<CalendarEvent>) => Promise<any>;
  onDelete: (eventId: string) => Promise<void>;
}

export const EventDetailsDialog: React.FC<EventDetailsDialogProps> = ({
  event,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');

  React.useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setStatus(event.status);
      setNotes(event.notes || '');
    }
  }, [event]);

  const handleSave = async () => {
    if (!event) return;

    await onUpdate(event.id, {
      title,
      description,
      status,
      notes,
    });

    setIsEditing(false);
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (!event) return;
    
    if (confirm('Are you sure you want to delete this event?')) {
      await onDelete(event.id);
      onOpenChange(false);
    }
  };

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Event' : event.title}</DialogTitle>
          <DialogDescription>
            {format(new Date(event.start_time), 'PPP p')} - {format(new Date(event.end_time), 'p')}
          </DialogDescription>
        </DialogHeader>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {event.description && (
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="mt-1">{event.description}</p>
              </div>
            )}

            <div>
              <Label className="text-muted-foreground">Status</Label>
              <p className="mt-1 capitalize">{event.status.replace('_', ' ')}</p>
            </div>

            <div>
              <Label className="text-muted-foreground">Type</Label>
              <p className="mt-1 capitalize">{event.event_type}</p>
            </div>

            {event.notes && (
              <div>
                <Label className="text-muted-foreground">Notes</Label>
                <p className="mt-1">{event.notes}</p>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </>
          ) : (
            <>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
