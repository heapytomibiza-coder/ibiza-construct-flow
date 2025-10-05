import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, parseISO } from 'date-fns';

interface CalendarEvent {
  id: string;
  user_id: string;
  job_id: string | null;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  event_type: string;
  location: any;
  attendees: string[];
  recurrence_rule: string | null;
  external_calendar_id: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export const useJobCalendar = (userId?: string, currentDate?: Date) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const monthStart = currentDate ? startOfMonth(currentDate) : startOfMonth(new Date());
  const monthEnd = currentDate ? endOfMonth(currentDate) : endOfMonth(new Date());

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .or(`user_id.eq.${userId},attendees.cs.{${userId}}`)
        .gte('start_time', monthStart.toISOString())
        .lte('end_time', monthEnd.toISOString())
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching calendar events:', error);
      } else {
        setEvents(data || []);
      }
      setLoading(false);
    };

    fetchEvents();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('calendar-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calendar_events'
        },
        () => {
          fetchEvents();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId, monthStart, monthEnd]);

  const createEvent = useCallback(async (event: Partial<CalendarEvent>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        title: event.title || 'Untitled Event',
        description: event.description,
        start_time: event.start_time!,
        end_time: event.end_time!,
        event_type: event.event_type || 'booking',
        location: event.location,
        attendees: event.attendees || [],
        recurrence_rule: event.recurrence_rule,
        external_calendar_id: event.external_calendar_id,
        metadata: event.metadata || {},
        job_id: event.job_id,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }, []);

  const updateEvent = useCallback(async (
    eventId: string,
    updates: Partial<CalendarEvent>
  ) => {
    const { error } = await supabase
      .from('calendar_events')
      .update(updates)
      .eq('id', eventId);

    if (error) throw error;
  }, []);

  const deleteEvent = useCallback(async (eventId: string) => {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', eventId);

    if (error) throw error;
  }, []);

  const checkConflicts = useCallback((
    startTime: Date,
    endTime: Date,
    excludeEventId?: string
  ) => {
    return events.filter(event => {
      if (excludeEventId && event.id === excludeEventId) return false;
      
      const eventStart = parseISO(event.start_time);
      const eventEnd = parseISO(event.end_time);
      
      return (
        (startTime >= eventStart && startTime < eventEnd) ||
        (endTime > eventStart && endTime <= eventEnd) ||
        (startTime <= eventStart && endTime >= eventEnd)
      );
    });
  }, [events]);

  return {
    events,
    loading,
    createEvent,
    updateEvent,
    deleteEvent,
    checkConflicts,
    eventsByType: {
      bookings: events.filter(e => e.event_type === 'booking'),
      availability: events.filter(e => e.event_type === 'availability'),
      meetings: events.filter(e => e.event_type === 'meeting'),
      deadlines: events.filter(e => e.event_type === 'deadline')
    }
  };
};
