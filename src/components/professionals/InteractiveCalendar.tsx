import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Check } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { format, addDays, startOfWeek } from 'date-fns';

interface InteractiveCalendarProps {
  onSelectSlot?: (date: Date, time: string) => void;
  availableSlots?: { date: Date; times: string[] }[];
}

export const InteractiveCalendar = ({
  onSelectSlot,
  availableSlots = []
}: InteractiveCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Generate next 7 days starting from today
  const today = new Date();
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(today, i));

  // Mock available time slots
  const mockTimeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', 
    '2:00 PM', '3:00 PM', '4:00 PM'
  ];

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (selectedDate && onSelectSlot) {
      onSelectSlot(selectedDate, time);
    }
  };

  return (
    <Card className="card-luxury">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Book a Consultation
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Select a date and time that works for you
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Selection */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Select Date</h4>
          <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
            {weekDays.map((date, index) => {
              const isSelected = selectedDate && 
                format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
              const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
              
              return (
                <motion.button
                  key={index}
                  onClick={() => handleDateSelect(date)}
                  className={`p-3 rounded-lg border-2 transition-all touch-target ${
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:border-primary/50 hover:bg-primary/5'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-xs font-medium">
                    {format(date, 'EEE')}
                  </div>
                  <div className="text-lg font-bold mt-1">
                    {format(date, 'd')}
                  </div>
                  {isToday && (
                    <div className="text-xs text-primary mt-1">Today</div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Time Slot Selection */}
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Available Times
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {mockTimeSlots.map((time, index) => {
                const isSelected = time === selectedTime;
                
                return (
                  <motion.button
                    key={index}
                    onClick={() => handleTimeSelect(time)}
                    className={`p-3 rounded-lg border-2 transition-all touch-target ${
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-primary/50 hover:bg-primary/5'
                    }`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div className="font-medium">{time}</div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Confirmation */}
        {selectedDate && selectedTime && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg bg-primary/10 border border-primary/20"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">Selected Time</p>
                <p className="text-sm text-muted-foreground">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')} at {selectedTime}
                </p>
              </div>
            </div>
            <Button className="w-full mt-4" size="lg">
              Confirm Booking
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
