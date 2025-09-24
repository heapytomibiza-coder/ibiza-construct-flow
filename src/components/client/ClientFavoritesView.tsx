import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, Heart, Star, MapPin, Phone, MessageSquare,
  Filter, Grid, List, Users, Award, Shield, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FavoriteProfessional {
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
  lastWorked: string;
  tags: string[];
  notes: string;
  projectsCompleted: number;
  totalSpent: number;
  availability: 'available' | 'busy' | 'unavailable';
}

const mockFavorites: FavoriteProfessional[] = [
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
    lastWorked: '2024-01-10',
    tags: ['villa A electricians', 'reliable', 'solar expert'],
    notes: 'Excellent work on the villa electrical upgrade. Very knowledgeable about solar installations.',
    projectsCompleted: 3,
    totalSpent: 2450,
    availability: 'available'
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
    lastWorked: '2023-12-20',
    tags: ['emergency service', 'kitchen specialist'],
    notes: 'Fast response for emergency plumbing. Great attention to detail in kitchen renovations.',
    projectsCompleted: 2,
    totalSpent: 1200,
    availability: 'busy'
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
    lastWorked: '2024-01-05',
    tags: ['luxury specialist', 'bathroom expert'],
    notes: 'Amazing tile work in our master bathroom. Very professional and clean work.',
    projectsCompleted: 1,
    totalSpent: 3200,
    availability: 'available'
  }
];

export const ClientFavoritesView = () => {
  const [favorites, setFavorites] = useState(mockFavorites);
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('lastWorked');

  const allTags = Array.from(new Set(favorites.flatMap(fav => fav.tags)));

  const filteredFavorites = favorites.filter(favorite => {
    const matchesSearch = favorite.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         favorite.speciality.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         favorite.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTag = !tagFilter || favorite.tags.includes(tagFilter);
    return matchesSearch && matchesTag;
  });

  const sortedFavorites = [...filteredFavorites].sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name);
      case 'rating': return b.rating - a.rating;
      case 'lastWorked': return new Date(b.lastWorked).getTime() - new Date(a.lastWorked).getTime();
      case 'totalSpent': return b.totalSpent - a.totalSpent;
      default: return 0;
    }
  });

  const removeFavorite = (professionalId: string) => {
    setFavorites(prev => prev.filter(fav => fav.id !== professionalId));
  };

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case 'available': return <Badge className="bg-green-100 text-green-700">Available</Badge>;
      case 'busy': return <Badge className="bg-orange-100 text-orange-700">Busy</Badge>;
      case 'unavailable': return <Badge className="bg-red-100 text-red-700">Unavailable</Badge>;
      default: return <Badge variant="outline">{availability}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-charcoal">Favorite Professionals</h2>
          <p className="text-muted-foreground">Your trusted network of construction professionals</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="card-luxury">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search professionals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg text-sm bg-white"
              >
                <option value="">All Tags</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg text-sm bg-white"
              >
                <option value="lastWorked">Last Worked</option>
                <option value="name">Name</option>
                <option value="rating">Rating</option>
                <option value="totalSpent">Total Spent</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-luxury">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-charcoal">{favorites.length}</div>
            <div className="text-sm text-muted-foreground">Favorite Pros</div>
          </CardContent>
        </Card>
        
        <Card className="card-luxury">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-charcoal">
              {favorites.reduce((sum, fav) => sum + fav.projectsCompleted, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Projects Together</div>
          </CardContent>
        </Card>
        
        <Card className="card-luxury">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-charcoal">
              €{favorites.reduce((sum, fav) => sum + fav.totalSpent, 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Invested</div>
          </CardContent>
        </Card>
        
        <Card className="card-luxury">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-charcoal">
              {(favorites.reduce((sum, fav) => sum + fav.rating, 0) / favorites.length).toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">Avg Rating</div>
          </CardContent>
        </Card>
      </div>

      {/* Professionals List */}
      {sortedFavorites.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedFavorites.map((professional) => (
              <Card key={professional.id} className="card-luxury hover:shadow-elegant transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-charcoal">{professional.name}</h3>
                        <p className="text-sm text-muted-foreground">{professional.speciality}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFavorite(professional.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Heart className="w-4 h-4 fill-red-500" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Rating and Availability */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold text-charcoal">{professional.rating}</span>
                      <span className="text-sm text-muted-foreground">({professional.reviews})</span>
                    </div>
                    {getAvailabilityBadge(professional.availability)}
                  </div>

                  {/* Work History */}
                  <div className="bg-sand-light p-3 rounded-lg">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Projects:</span>
                        <span className="font-medium text-charcoal ml-1">{professional.projectsCompleted}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Spent:</span>
                        <span className="font-medium text-charcoal ml-1">€{professional.totalSpent}</span>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Last worked: {new Date(professional.lastWorked).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Tags */}
                  {professional.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {professional.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {professional.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{professional.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  {professional.notes && (
                    <div className="p-2 bg-copper/5 rounded border-l-2 border-copper">
                      <p className="text-xs text-charcoal line-clamp-2">{professional.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-gradient-hero text-white">
                      Book Again
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="card-luxury">
            <CardContent className="p-0">
              <div className="space-y-1">
                {sortedFavorites.map((professional) => (
                  <div key={professional.id} className="flex items-center gap-4 p-4 hover:bg-sand-light/50 transition-colors">
                    <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                      <div>
                        <h4 className="font-medium text-charcoal">{professional.name}</h4>
                        <p className="text-sm text-muted-foreground">{professional.speciality}</p>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold text-charcoal">{professional.rating}</span>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        {professional.projectsCompleted} projects
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        €{professional.totalSpent}
                      </div>
                      
                      <div>
                        {getAvailabilityBadge(professional.availability)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button size="sm" className="bg-gradient-hero text-white">
                        Book Again
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFavorite(professional.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Heart className="w-4 h-4 fill-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      ) : (
        <Card className="card-luxury">
          <CardContent className="text-center py-12">
            <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-display font-semibold mb-2">No favorites found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || tagFilter 
                ? 'Try adjusting your search or filters' 
                : 'Add professionals to your favorites as you work with them'
              }
            </p>
            {!searchQuery && !tagFilter && (
              <Button className="bg-gradient-hero text-white">
                <Search className="w-4 h-4 mr-2" />
                Find Professionals
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};