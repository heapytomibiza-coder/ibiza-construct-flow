import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePresence } from '@/hooks/usePresence';
import { PresenceIndicator } from './PresenceIndicator';
import { useAuth } from '@/hooks/useAuth';

const STATUS_OPTIONS = [
  { value: 'online', label: 'Online' },
  { value: 'away', label: 'Away' },
  { value: 'busy', label: 'Busy' },
];

const EMOJI_OPTIONS = ['💼', '🏠', '☕', '🌴', '✈️', '📚', '💪', '🎮', '🎵', '🍕'];

export const StatusSelector = () => {
  const { user } = useAuth();
  const { getUserPresence, updateStatus } = usePresence();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customStatus, setCustomStatus] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'online' | 'away' | 'busy'>('online');

  const currentPresence = user ? getUserPresence(user.id) : null;

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateStatus(selectedStatus, customStatus || undefined, selectedEmoji || undefined);
      setOpen(false);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          {user && <PresenceIndicator userId={user.id} size="sm" />}
          <span className="text-sm">
            {currentPresence?.custom_status || 'Set status'}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Set your status</h4>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={selectedStatus}
              onValueChange={(value: any) => setSelectedStatus(value)}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="emoji">Emoji (optional)</Label>
            <div className="grid grid-cols-5 gap-1">
              {EMOJI_OPTIONS.map(emoji => (
                <Button
                  key={emoji}
                  variant={selectedEmoji === emoji ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedEmoji(emoji === selectedEmoji ? '' : emoji)}
                  className="text-xl p-2"
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-status">Custom message (optional)</Label>
            <Input
              id="custom-status"
              placeholder="What's on your mind?"
              value={customStatus}
              onChange={(e) => setCustomStatus(e.target.value)}
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">
              {customStatus.length}/50 characters
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
