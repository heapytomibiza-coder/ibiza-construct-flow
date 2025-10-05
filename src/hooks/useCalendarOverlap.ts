import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { addHours, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';

interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

interface OverlapSuggestion {
  start: Date;
  end: Date;
  duration: number; // in minutes
  confidence: 'high' | 'medium' | 'low';
}

export function useCalendarOverlap(userId1?: string, userId2?: string) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<OverlapSuggestion[]>([]);

  const findOverlaps = useCallback(async (targetDate?: Date) => {
    if (!userId1 || !userId2) return;

    setLoading(true);
    try {
      const date = targetDate || new Date();
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      // Fetch calendar events for both users
      const { data: events1 } = await supabase
        .from('calendar_events')
        .select('start_time, end_time')
        .eq('user_id', userId1)
        .gte('start_time', dayStart.toISOString())
        .lte('end_time', dayEnd.toISOString());

      const { data: events2 } = await supabase
        .from('calendar_events')
        .select('start_time, end_time')
        .eq('user_id', userId2)
        .gte('start_time', dayStart.toISOString())
        .lte('end_time', dayEnd.toISOString());

      // Find free slots for both users
      const businessHours = {
        start: 8, // 8 AM
        end: 20,  // 8 PM
      };

      const freeSlots: TimeSlot[] = [];
      let currentTime = addHours(dayStart, businessHours.start);
      const endTime = addHours(dayStart, businessHours.end);

      while (isBefore(currentTime, endTime)) {
        const slotEnd = addHours(currentTime, 2); // 2-hour slots

        // Check if this slot is free for both users
        const isFreeForUser1 = !events1?.some(event =>
          (isAfter(new Date(event.start_time), currentTime) && isBefore(new Date(event.start_time), slotEnd)) ||
          (isAfter(new Date(event.end_time), currentTime) && isBefore(new Date(event.end_time), slotEnd))
        );

        const isFreeForUser2 = !events2?.some(event =>
          (isAfter(new Date(event.start_time), currentTime) && isBefore(new Date(event.start_time), slotEnd)) ||
          (isAfter(new Date(event.end_time), currentTime) && isBefore(new Date(event.end_time), slotEnd))
        );

        if (isFreeForUser1 && isFreeForUser2) {
          freeSlots.push({
            start: currentTime,
            end: slotEnd,
            available: true,
          });
        }

        currentTime = addHours(currentTime, 1); // Move by 1 hour
      }

      // Convert to suggestions with confidence scores
      const overlaps: OverlapSuggestion[] = freeSlots.map((slot, index) => ({
        start: slot.start,
        end: slot.end,
        duration: 120, // 2 hours
        confidence: (index === 0 ? 'high' : index === 1 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
      })).slice(0, 3); // Top 3 suggestions

      setSuggestions(overlaps);
    } catch (error) {
      console.error('Error finding calendar overlaps:', error);
    } finally {
      setLoading(false);
    }
  }, [userId1, userId2]);

  useEffect(() => {
    if (userId1 && userId2) {
      findOverlaps();
    }
  }, [userId1, userId2, findOverlaps]);

  return {
    suggestions,
    loading,
    findOverlaps,
  };
}
