import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useBookingSlots } from '@/hooks/useBookingSlots';
import { Clock, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface BookingSlotPickerProps {
  professionalId: string;
  professionalName: string;
  durationMinutes?: number;
  onBookingConfirmed?: (booking: any) => void;
}

export function BookingSlotPicker({
  professionalId,
  professionalName,
  durationMinutes = 60,
  onBookingConfirmed
}: BookingSlotPickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  
  const { slots, loading, selectedSlot, setSelectedSlot, bookSlot } = useBookingSlots(
    professionalId,
    selectedDate,
    durationMinutes
  );

  const handleBooking = async () => {
    if (!selectedSlot) return;

    const booking = await bookSlot(selectedSlot, {
      title: `Meeting with ${professionalName}`,
      description: `${durationMinutes} minute session`,
    });

    if (booking) {
      onBookingConfirmed?.(booking);
      setShowBookingDialog(false);
    }
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Book a Time Slot
        </CardTitle>
        <CardDescription>
          Select a date and available time slot with {professionalName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Calendar Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Duration: {durationMinutes} minutes</span>
            </div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              disabled={(date) => date < new Date()}
              className="rounded-md border"
            />
          </div>

          {/* Available Slots Section */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">
                Available Times on {format(selectedDate, 'MMM dd, yyyy')}
              </h3>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : slots.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No available slots for this date</p>
                  <p className="text-sm mt-2">Try selecting another day</p>
                </div>
              ) : (
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-2">
                    {slots.map((slot, index) => (
                      <Button
                        key={index}
                        variant={selectedSlot === slot ? 'default' : 'outline'}
                        className="w-full justify-between"
                        onClick={() => setSelectedSlot(slot)}
                      >
                        <span className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {formatTime(slot.slot_start)} - {formatTime(slot.slot_end)}
                        </span>
                        {selectedSlot === slot && (
                          <Badge variant="secondary">Selected</Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>

            {selectedSlot && (
              <div className="pt-4 border-t">
                <Button
                  className="w-full"
                  onClick={handleBooking}
                  size="lg"
                >
                  Confirm Booking
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  You'll receive reminders 24 hours and 2 hours before
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
