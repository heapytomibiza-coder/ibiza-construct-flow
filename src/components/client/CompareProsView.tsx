import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, Filter, Map, List, Star, MapPin, 
  Clock, Shield, Award, Phone, MessageSquare,
  Heart, BarChart3, ChevronDown, Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Professional {
  id: string;
  name: string;
  speciality: string;
  rating: number;
  reviews: number;
  distance: number;
  hourlyRate: number;
  avatar: string;
  verified: boolean;
  insured: boolean;
  responseTime: string;
  completedJobs: number;
  languages: string[];
  availability: string;
  badges: string[];
}

const mockProfessionals: Professional[] = [
  {
    id: '1',
    name: 'Maria Santos',
    speciality: 'Electrical & Solar Systems',
    rating: 4.9,
    reviews: 127,
    distance: 2.3,
    hourlyRate: 65,
    avatar: '/api/placeholder/48/48',
    verified: true,
    insured: true,
    responseTime: '< 2 hours',
    completedJobs: 145,
    languages: ['Spanish', 'English'],
    availability: 'Available next week',
    badges: ['Top Rated', 'Quick Response', 'Eco Expert']
  },
  {
    id: '2',
    name: 'João Silva',
    speciality: 'Plumbing & Heating',
    rating: 4.8,
    reviews: 89,
    distance: 1.8,
    hourlyRate: 58,
    avatar: '/api/placeholder/48/48',
    verified: true,
    insured: true,
    responseTime: '< 4 hours',
    completedJobs: 98,
    languages: ['Portuguese', 'English'],
    availability: 'Available tomorrow',
    badges: ['Reliable', 'Emergency Service']
  },
  {
    id: '3',
    name: 'Ahmed Al-Rashid',
    speciality: 'Tiling & Bathroom Renovation',
    rating: 4.7,
    reviews: 156,
    distance: 3.1,
    hourlyRate: 72,
    avatar: '/api/placeholder/48/48',
    verified: true,
    insured: true,
    responseTime: '< 1 hour',
    completedJobs: 203,
    languages: ['Arabic', 'English', 'Spanish'],
    availability: 'Available this week',
    badges: ['Master Craftsman', 'Luxury Specialist']
  }
];

export const CompareProsView = () => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPros, setSelectedPros] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    maxDistance: 10,
    minRating: 4.0,
    maxHourlyRate: 100,
    verified: false,
    insured: false,
    available: false
  });

  const toggleProSelection = (proId: string) => {
    setSelectedPros(prev => {
      if (prev.includes(proId)) {
        return prev.filter(id => id !== proId);
      } else if (prev.length < 3) {
        return [...prev, proId];
      }
      return prev;
    });
  };

  const filteredProfessionals = mockProfessionals.filter(pro => {
    const matchesSearch = pro.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pro.speciality.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDistance = pro.distance <= filters.maxDistance;
    const matchesRating = pro.rating >= filters.minRating;
    const matchesRate = pro.hourlyRate <= filters.maxHourlyRate;
    const matchesVerified = !filters.verified || pro.verified;
    const matchesInsured = !filters.insured || pro.insured;
    
    return matchesSearch && matchesDistance && matchesRating && matchesRate && 
           matchesVerified && matchesInsured;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header with Search and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Search professionals, skills, or specialities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4 mr-2" />
            List
          </Button>
          <Button
            variant={viewMode === 'map' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('map')}
          >
            <Map className="w-4 h-4 mr-2" />
            Map
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Found {filteredProfessionals.length} professionals in your area
        </p>
        {selectedPros.length > 0 && (
          <Button className="bg-gradient-hero text-white">
            <BarChart3 className="w-4 h-4 mr-2" />
            Compare {selectedPros.length} Selected
          </Button>
        )}
      </div>

      {/* Professionals List */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProfessionals.map((pro) => (
            <Card 
              key={pro.id} 
              className={cn(
                "card-luxury transition-all duration-300 hover:shadow-elegant cursor-pointer",
                selectedPros.includes(pro.id) && "border-copper shadow-luxury"
              )}
              onClick={() => toggleProSelection(pro.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      {pro.verified && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <Shield className="w-2 h-2 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-charcoal">{pro.name}</h3>
                      <p className="text-sm text-muted-foreground">{pro.speciality}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1"
                  >
                    <Heart className={cn(
                      "w-4 h-4",
                      selectedPros.includes(pro.id) ? "text-red-500 fill-red-500" : "text-muted-foreground"
                    )} />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Rating and Stats */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold text-charcoal">{pro.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">({pro.reviews} reviews)</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    €{pro.hourlyRate}/hour
                  </Badge>
                </div>

                {/* Key Info */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{pro.distance}km away</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{pro.responseTime}</span>
                  </div>
                </div>

                {/* Badges */}
                {pro.badges.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {pro.badges.slice(0, 2).map((badge) => (
                      <Badge key={badge} variant="secondary" className="text-xs">
                        {badge}
                      </Badge>
                    ))}
                    {pro.badges.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{pro.badges.length - 2} more
                      </Badge>
                    )}
                  </div>
                )}

                {/* Availability */}
                <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs text-green-700 font-medium">{pro.availability}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1 bg-gradient-hero text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle quote request
                    }}
                  >
                    Request Quote
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle message
                    }}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle call
                    }}
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Map View Placeholder */}
      {viewMode === 'map' && (
        <Card className="card-luxury h-96">
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center">
              <Map className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-display font-semibold mb-2">Map View</h3>
              <p className="text-muted-foreground">Interactive map with professional locations coming soon</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compare Drawer (shows when professionals selected) */}
      {selectedPros.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-elegant p-4 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h4 className="font-display font-semibold">Compare Selected ({selectedPros.length}/3)</h4>
              <div className="flex gap-2">
                {selectedPros.map((proId) => {
                  const pro = mockProfessionals.find(p => p.id === proId);
                  return pro ? (
                    <Badge key={proId} variant="secondary" className="flex items-center gap-1">
                      {pro.name}
                      <button
                        onClick={() => toggleProSelection(proId)}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setSelectedPros([])}
              >
                Clear All
              </Button>
              <Button className="bg-gradient-hero text-white">
                <BarChart3 className="w-4 h-4 mr-2" />
                Compare Details
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};