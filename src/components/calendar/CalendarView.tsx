import React, { useState, useMemo } from 'react';
import { Calendar as BigCalendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCalendarEvents, CalendarEvent } from '@/hooks/useCalendarEvents';
import { EventDetailsDialog } from './EventDetailsDialog';
import { CreateEventDialog } from './CreateEventDialog';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar-custom.css';

const localizer = momentLocalizer(moment);

interface CalendarViewProps {
  userId: string;
  onEventClick?: (event: CalendarEvent) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ userId, onEventClick }) => {
  const { events, loading, createEvent, updateEvent, deleteEvent } = useCalendarEvents(userId);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [currentView, setCurrentView] = useState<View>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Transform events for react-big-calendar
  const calendarEvents = useMemo(() => {
    return events.map(event => ({
      ...event,
      start: new Date(event.start_time),
      end: new Date(event.end_time),
      title: event.title,
      resource: event
    }));
  }, [events]);

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event.resource);
    setDetailsOpen(true);
    onEventClick?.(event.resource);
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setCreateOpen(true);
  };

  const eventStyleGetter = (event: any) => {
    const colors: Record<string, string> = {
      booking: '#d4a574',
      meeting: '#4a5568',
      reminder: '#718096',
      other: '#a0aec0'
    };

    const statusColors: Record<string, string> = {
      scheduled: '#3b82f6',
      confirmed: '#10b981',
      in_progress: '#f59e0b',
      completed: '#6b7280',
      cancelled: '#ef4444',
      no_show: '#991b1b'
    };

    const backgroundColor = event.resource?.color || 
                           statusColors[event.resource?.status] || 
                           colors[event.resource?.event_type] || 
                           colors.other;

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block'
      }
    };
  };

  const handleNavigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
    const newDate = new Date(currentDate);
    
    switch (action) {
      case 'PREV':
        if (currentView === 'month') {
          newDate.setMonth(newDate.getMonth() - 1);
        } else if (currentView === 'week') {
          newDate.setDate(newDate.getDate() - 7);
        } else {
          newDate.setDate(newDate.getDate() - 1);
        }
        break;
      case 'NEXT':
        if (currentView === 'month') {
          newDate.setMonth(newDate.getMonth() + 1);
        } else if (currentView === 'week') {
          newDate.setDate(newDate.getDate() + 7);
        } else {
          newDate.setDate(newDate.getDate() + 1);
        }
        break;
      case 'TODAY':
        return setCurrentDate(new Date());
    }
    
    setCurrentDate(newDate);
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        {/* Custom Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => handleNavigate('PREV')}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={() => handleNavigate('TODAY')}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={() => handleNavigate('NEXT')}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <h2 className="text-xl font-semibold">
              {moment(currentDate).format('MMMM YYYY')}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant={currentView === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentView('month')}
              >
                Month
              </Button>
              <Button
                variant={currentView === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentView('week')}
              >
                Week
              </Button>
              <Button
                variant={currentView === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentView('day')}
              >
                Day
              </Button>
            </div>
            <Button onClick={() => setCreateOpen(true)} className="bg-gradient-hero hover:bg-copper">
              <Plus className="w-4 h-4 mr-2" />
              New Event
            </Button>
          </div>
        </div>

        {/* Calendar */}
        <div style={{ height: 600 }}>
          <BigCalendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            view={currentView}
            onView={setCurrentView}
            date={currentDate}
            onNavigate={setCurrentDate}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            eventPropGetter={eventStyleGetter}
            toolbar={false}
          />
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-3">
          <Badge variant="outline" className="bg-blue-500/10 text-blue-700">
            Scheduled
          </Badge>
          <Badge variant="outline" className="bg-green-500/10 text-green-700">
            Confirmed
          </Badge>
          <Badge variant="outline" className="bg-orange-500/10 text-orange-700">
            In Progress
          </Badge>
          <Badge variant="outline" className="bg-gray-500/10 text-gray-700">
            Completed
          </Badge>
          <Badge variant="outline" className="bg-red-500/10 text-red-700">
            Cancelled
          </Badge>
        </div>
      </Card>

      <EventDetailsDialog
        event={selectedEvent}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onUpdate={updateEvent}
        onDelete={deleteEvent}
      />

      <CreateEventDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={createEvent}
        userId={userId}
      />
    </>
  );
};
