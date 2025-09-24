import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, Filter, Plus, Eye, MessageSquare, 
  Clock, CheckCircle, AlertCircle, XCircle,
  Calendar, MapPin, Euro, MoreHorizontal,
  Edit, Trash2, Copy
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClientJobsViewProps {
  bookings: any[];
  loading: boolean;
}

const statusConfig = {
  draft: { icon: Edit, color: 'text-gray-500', bg: 'bg-gray-100', label: 'Draft' },
  open: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-100', label: 'Open' },
  quoting: { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-100', label: 'Quoting' },
  booked: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100', label: 'Booked' },
  in_progress: { icon: Clock, color: 'text-copper', bg: 'bg-copper/10', label: 'In Progress' },
  needs_info: { icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-100', label: 'Needs Info' },
  completed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Completed' },
  disputed: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100', label: 'Disputed' },
  refunded: { icon: XCircle, color: 'text-gray-500', bg: 'bg-gray-100', label: 'Refunded' }
};

export const ClientJobsView = ({ bookings, loading }: ClientJobsViewProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.services?.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.services?.micro?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusInfo = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="h-32">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-charcoal">My Jobs</h2>
          <p className="text-muted-foreground">Track and manage your construction projects</p>
        </div>
        <Button className="bg-gradient-hero text-white">
          <Plus className="w-4 h-4 mr-2" />
          Post New Job
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm bg-white"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="open">Open</option>
            <option value="quoting">Quoting</option>
            <option value="booked">Booked</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="disputed">Disputed</option>
          </select>
          
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Jobs List */}
      {filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const statusInfo = getStatusInfo(booking.status);
            const StatusIcon = statusInfo.icon;
            
            return (
              <Card key={booking.id} className="card-luxury hover:shadow-elegant transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-display font-semibold text-charcoal mb-1">
                            {booking.title || 'Untitled Job'}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            {booking.services?.category} • {booking.services?.subcategory} • {booking.services?.micro}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge className={cn("flex items-center gap-1", statusInfo.bg, statusInfo.color)}>
                            <StatusIcon className="w-3 h-3" />
                            {statusInfo.label}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Created {new Date(booking.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        {booking.budget_range && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Euro className="w-4 h-4" />
                            <span>{booking.budget_range}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>Ibiza</span>
                        </div>
                      </div>

                      {/* Description */}
                      {booking.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {booking.description}
                        </p>
                      )}

                      {/* Progress Indicators */}
                      {booking.status === 'in_progress' && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">65%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-gradient-hero h-2 rounded-full" style={{ width: '65%' }}></div>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button size="sm" className="bg-gradient-hero text-white">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        
                        <Button variant="outline" size="sm">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Messages
                        </Button>

                        {booking.status === 'draft' && (
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-2" />
                            Continue Editing
                          </Button>
                        )}

                        {booking.status === 'completed' && (
                          <Button variant="outline" size="sm">
                            <Copy className="w-4 h-4 mr-2" />
                            Rehire
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="card-luxury">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-display font-semibold mb-2">No jobs found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Start by posting your first job to connect with professionals'
              }
            </p>
            <Button className="bg-gradient-hero text-white">
              <Plus className="w-4 h-4 mr-2" />
              Post Your First Job
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};