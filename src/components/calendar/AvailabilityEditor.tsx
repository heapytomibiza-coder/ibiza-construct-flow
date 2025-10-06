import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type DaySchedule = { enabled: boolean; start: string; end: string; };
type WeeklySchedule = Record<number, DaySchedule>; // 0-6 (Sunday-Saturday)

export interface AvailabilityEditorProps {
  schedule: WeeklySchedule;
  bufferMinutes: number;
  onChange: (next: { schedule: WeeklySchedule; bufferMinutes: number }) => void;
  onSave: () => Promise<void>;
  loading?: boolean;
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const dayAbbrev = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AvailabilityEditor({
  schedule,
  bufferMinutes,
  onChange,
  onSave,
  loading = false
}: AvailabilityEditorProps) {
  const setDay = (idx: number, patch: Partial<DaySchedule>) => {
    const next = { ...schedule, [idx]: { ...schedule[idx], ...patch } };
    onChange({ schedule: next, bufferMinutes });
  };

  const toggleAllDays = (enabled: boolean) => {
    const next = { ...schedule };
    for (let i = 0; i < 7; i++) {
      next[i] = { ...next[i], enabled };
    }
    onChange({ schedule: next, bufferMinutes });
  };

  const setWorkweek = () => {
    const next = { ...schedule };
    for (let i = 0; i < 7; i++) {
      next[i] = {
        ...next[i],
        enabled: i >= 1 && i <= 5, // Monday-Friday
        start: '09:00',
        end: '17:00'
      };
    }
    onChange({ schedule: next, bufferMinutes });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Availability</CardTitle>
        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" onClick={setWorkweek}>
            Set Workweek (9-5)
          </Button>
          <Button size="sm" variant="outline" onClick={() => toggleAllDays(true)}>
            Enable All
          </Button>
          <Button size="sm" variant="outline" onClick={() => toggleAllDays(false)}>
            Disable All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Desktop view */}
        <div className="hidden md:block space-y-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="grid grid-cols-12 items-center gap-4">
              <div className="col-span-2">
                <Label>{dayNames[i]}</Label>
              </div>
              <div className="col-span-2 flex items-center">
                <Switch 
                  checked={schedule[i]?.enabled || false} 
                  onCheckedChange={(v) => setDay(i, { enabled: v })} 
                />
              </div>
              <div className="col-span-8 flex items-center gap-2">
                <Input 
                  type="time" 
                  value={schedule[i]?.start || '09:00'} 
                  onChange={(e) => setDay(i, { start: e.target.value })} 
                  disabled={!schedule[i]?.enabled}
                  className="w-32"
                />
                <span className="text-muted-foreground">to</span>
                <Input 
                  type="time" 
                  value={schedule[i]?.end || '17:00'} 
                  onChange={(e) => setDay(i, { end: e.target.value })} 
                  disabled={!schedule[i]?.enabled}
                  className="w-32"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Mobile view */}
        <div className="md:hidden space-y-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <Label>{dayAbbrev[i]}</Label>
                <Switch 
                  checked={schedule[i]?.enabled || false} 
                  onCheckedChange={(v) => setDay(i, { enabled: v })} 
                />
              </div>
              {schedule[i]?.enabled && (
                <div className="flex items-center gap-2">
                  <Input 
                    type="time" 
                    value={schedule[i]?.start || '09:00'} 
                    onChange={(e) => setDay(i, { start: e.target.value })} 
                  />
                  <span className="text-muted-foreground text-sm">to</span>
                  <Input 
                    type="time" 
                    value={schedule[i]?.end || '17:00'} 
                    onChange={(e) => setDay(i, { end: e.target.value })} 
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 pt-4 border-t">
          <Label className="whitespace-nowrap">Buffer between bookings</Label>
          <Input 
            type="number" 
            min={0} 
            max={180} 
            value={bufferMinutes} 
            onChange={(e) => onChange({ schedule, bufferMinutes: Number(e.target.value) })}
            className="w-24"
          />
          <span className="text-sm text-muted-foreground">minutes</span>
        </div>

        <div className="pt-2">
          <Button onClick={onSave} disabled={loading} className="w-full md:w-auto">
            {loading ? 'Saving...' : 'Save Availability'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
