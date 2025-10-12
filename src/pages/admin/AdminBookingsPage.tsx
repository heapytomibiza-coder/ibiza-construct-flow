import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Eye } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminBookingsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['admin-bookings', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('bookings')
        .select('*, profiles!bookings_client_id_fkey(full_name, display_name)')
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'secondary',
      pending_match: 'default',
      matched: 'default',
      confirmed: 'secondary',
      completed: 'secondary',
      cancelled: 'destructive',
    };
    return colors[status] || 'secondary';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Booking Management</h1>
        <p className="text-muted-foreground">Monitor all bookings and their status</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search bookings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading bookings...</div>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings?.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{booking.title}</h3>
                      <Badge variant={getStatusColor(booking.status) as any}>
                        {booking.status?.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{booking.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Client: {booking.profiles?.full_name || booking.profiles?.display_name || 'Unknown'}</span>
                      <span>•</span>
                      <span>Created: {format(new Date(booking.created_at), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
