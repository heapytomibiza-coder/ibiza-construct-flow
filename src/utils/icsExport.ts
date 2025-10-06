import { format } from 'date-fns';

interface ICSEvent {
  title: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  attendees?: string[];
}

export function generateICS(event: ICSEvent): string {
  const formatDate = (date: Date) => {
    return format(date, "yyyyMMdd'T'HHmmss");
  };

  const escape = (str: string) => {
    return str.replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  };

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Your App//Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `DTSTART:${formatDate(event.startTime)}`,
    `DTEND:${formatDate(event.endTime)}`,
    `DTSTAMP:${formatDate(new Date())}`,
    `SUMMARY:${escape(event.title)}`,
  ];

  if (event.description) {
    lines.push(`DESCRIPTION:${escape(event.description)}`);
  }

  if (event.location) {
    lines.push(`LOCATION:${escape(event.location)}`);
  }

  if (event.attendees && event.attendees.length > 0) {
    event.attendees.forEach(email => {
      lines.push(`ATTENDEE;CN=${email}:mailto:${email}`);
    });
  }

  lines.push(
    `UID:${Date.now()}@yourapp.com`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  );

  return lines.join('\r\n');
}

export function downloadICS(event: ICSEvent, filename: string = 'event.ics') {
  const icsContent = generateICS(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
