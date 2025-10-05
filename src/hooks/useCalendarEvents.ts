import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CalendarEvent {
  id: string;
  user_id: string;
  job_id?: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  event_type: string;
  status: string;
  color?: string;
  location?: any;
  attendees?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useCalendarEvents = (userId?: string) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .or(`user_id.eq.${userId},attendees.cs.{${userId}}`)
        .order('start_time', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      toast.error('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchEvents();

    if (!userId) return;

    // Subscribe to realtime updates
    const channel = supabase
      .channel('calendar-events')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calendar_events',
          filter: `user_id=eq.${userId}`
        },
        () => {
          fetchEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchEvents]);

  const createEvent = async (eventData: Partial<CalendarEvent>) => {
    try {
      // Ensure required fields are present
      if (!eventData.title || !eventData.start_time || !eventData.end_time) {
        throw new Error('Title, start time, and end time are required');
      }

      const { data, error } = await supabase
        .from('calendar_events')
        .insert([{
          title: eventData.title,
          start_time: eventData.start_time,
          end_time: eventData.end_time,
          user_id: userId!,
          description: eventData.description,
          event_type: eventData.event_type || 'other',
          status: eventData.status || 'scheduled',
          color: eventData.color,
          location: eventData.location,
          attendees: eventData.attendees,
          notes: eventData.notes,
          job_id: eventData.job_id,
        }])
        .select()
        .single();

      if (error) throw error;
      toast.success('Event created successfully');
      return data;
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
      throw error;
    }
  };

  const updateEvent = async (eventId: string, updates: Partial<CalendarEvent>) => {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .update(updates)
        .eq('id', eventId)
        .select()
        .single();

      if (error) throw error;
      toast.success('Event updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
      throw error;
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      toast.success('Event deleted successfully');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
      throw error;
    }
  };

  return {
    events,
    loading,
    createEvent,
    updateEvent,
    deleteEvent,
    refetch: fetchEvents
  };
};
