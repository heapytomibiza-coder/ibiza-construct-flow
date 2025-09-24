import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { 
  Filter, Map, List, Search, Star, MapPin, Clock, 
  Euro, Shield, CheckCircle, Award, Phone, MessageSquare,
  Heart, GitCompare, Eye, Zap, TrendingUp, AlertCircle,
  X, ChevronDown, ChevronUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Professional {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  distance: number;
  hourlyRate: number;
  specialties: string[];
  verified: boolean;
  insured: boolean;
  responseTime: string;
  completionRate: number;
  languages: string[];
  avatar: string;
  portfolio: string[];
  recentReviews: Array<{
    text: string;
    rating: number;
    date: string;
    client: string;
  }>;
}

const EnhancedComparePros = () => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [filteredPros, setFilteredPros] = useState<Professional[]>([]);
  const [selectedPros, setSelectedPros] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [minRating, setMinRating] = useState(0);
  const [maxDistance, setMaxDistance] = useState(50);
  const [requireVerified, setRequireVerified] = useState(false);
  const [requireInsured, setRequireInsured] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Mock data
  const mockProfessionals: Professional[] = [
    {
      id: '1',
      name: 'Maria Santos',
      rating: 4.9,
      reviewCount: 127,
      distance: 2.3,
      hourlyRate: 85,
      specialties: ['Electrical', 'Smart Home', 'Solar'],
      verified: true,
      insured: true,
      responseTime: '< 2 hours',
      completionRate: 98,
      languages: ['English', 'Spanish', 'Portuguese'],
      avatar: '/placeholder.svg',
      portfolio: ['/placeholder.svg', '/placeholder.svg'],
      recentReviews: [
        { text: 'Excellent work on our kitchen rewiring', rating: 5, date: '2024-01-15', client: 'John D.' },
        { text: 'Professional and on time', rating: 5, date: '2024-01-10', client: 'Sarah M.' }
      ]
    },
    {
      id: '2',
      name: 'James Wilson',
      rating: 4.7,
      reviewCount: 89,
      distance: 5.1,
      hourlyRate: 75,
      specialties: ['Plumbing', 'Heating', 'Bathroom'],
      verified: true,
      insured: true,
      responseTime: '< 4 hours',
      completionRate: 95,
      languages: ['English', 'French'],
      avatar: '/placeholder.svg',
      portfolio: ['/placeholder.svg'],
      recentReviews: [
        { text: 'Fixed our heating system quickly', rating: 5, date: '2024-01-12', client: 'Mike R.' }
      ]
    },
    {
      id: '3',
      name: 'Anna Kowalski',
      rating: 4.8,
      reviewCount: 156,
      distance: 8.2,
      hourlyRate: 95,
      specialties: ['Carpentry', 'Furniture', 'Custom Build'],
      verified: true,
      insured: false,
      responseTime: '< 6 hours',
      completionRate: 97,
      languages: ['English', 'Polish', 'German'],
      avatar: '/placeholder.svg',
      portfolio: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
      recentReviews: [
        { text: 'Beautiful custom shelving', rating: 5, date: '2024-01-08', client: 'Lisa K.' }
      ]
    }
  ];

  const languages = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Polish'];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setProfessionals(mockProfessionals);
      setFilteredPros(mockProfessionals);
      setLoading(false);
    }, 1500);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, priceRange, minRating, maxDistance, requireVerified, requireInsured, selectedLanguages, professionals]);

  const applyFilters = () => {
    let filtered = professionals.filter(pro => {
      // Search term
      if (searchTerm && !pro.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !pro.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))) {
        return false;
      }
      
      // Price range
      if (pro.hourlyRate < priceRange[0] || pro.hourlyRate > priceRange[1]) {
        return false;
      }
      
      // Rating
      if (pro.rating < minRating) {
        return false;
      }
      
      // Distance
      if (pro.distance > maxDistance) {
        return false;
      }
      
      // Verified
      if (requireVerified && !pro.verified) {
        return false;
      }
      
      // Insured
      if (requireInsured && !pro.insured) {
        return false;
      }
      
      // Languages
      if (selectedLanguages.length > 0 && !selectedLanguages.some(lang => pro.languages.includes(lang))) {
        return false;
      }
      
      return true;
    });
    
    setFilteredPros(filtered);
  };

  const toggleFavorite = (proId: string) => {
    setFavorites(prev => 
      prev.includes(proId) 
        ? prev.filter(id => id !== proId)
        : [...prev, proId]
    );
  };

  const toggleComparison = (proId: string) => {
    setSelectedPros(prev => {
      if (prev.includes(proId)) {
        return prev.filter(id => id !== proId);
      } else if (prev.length < 3) {
        return [...prev, proId];
      } else {
        toast.error('You can compare up to 3 professionals');
        return prev;
      }
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPriceRange([0, 200]);
    setMinRating(0);
    setMaxDistance(50);
    setRequireVerified(false);
    setRequireInsured(false);
    setSelectedLanguages([]);
  };

  const renderProfessionalCard = (pro: Professional) => (
    <Card key={pro.id} className="overflow-hidden hover:shadow-lg transition-all">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="relative">
            <img 
              src={pro.avatar} 
              alt={pro.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            {pro.verified && (
              <CheckCircle className="w-5 h-5 text-green-500 absolute -bottom-1 -right-1 bg-white rounded-full" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg text-foreground">{pro.name}</h3>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleFavorite(pro.id)}
                  className={cn(
                    "p-2",
                    favorites.includes(pro.id) && "text-red-500 border-red-200"
                  )}
                >
                  <Heart className={cn("w-4 h-4", favorites.includes(pro.id) && "fill-current")} />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleComparison(pro.id)}
                  className={cn(
                    "p-2",
                    selectedPros.includes(pro.id) && "bg-primary text-primary-foreground"
                  )}
                >
                  <GitCompare className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="font-medium">{pro.rating}</span>
                <span className="text-muted-foreground">({pro.reviewCount})</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{pro.distance}km away</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{pro.responseTime}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {pro.specialties.map((specialty) => (
                <Badge key={specialty} variant="secondary">
                  {specialty}
                </Badge>
              ))}
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="font-semibold text-primary">
                €{pro.hourlyRate}/hour
              </div>
              <div className="flex items-center gap-2">
                {pro.verified && (
                  <Badge className="bg-green-100 text-green-800">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {pro.insured && (
                  <Badge className="bg-blue-100 text-blue-800">
                    <Award className="w-3 h-3 mr-1" />
                    Insured
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button size="sm" className="bg-primary text-primary-foreground">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message
                </Button>
                <Button size="sm" variant="outline">
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
              </div>
              <Button size="sm" variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                View Profile
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderComparison = () => {
    const comparePros = professionals.filter(pro => selectedPros.includes(pro.id));
    
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5" />
            Compare Professionals ({comparePros.length}/3)
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowComparison(!showComparison)}
            >
              {showComparison ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CardTitle>
        </CardHeader>
        {showComparison && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {comparePros.map((pro) => (
                <div key={pro.id} className="space-y-4 p-4 border rounded-lg">
                  <div className="text-center">
                    <img 
                      src={pro.avatar} 
                      alt={pro.name}
                      className="w-16 h-16 rounded-full mx-auto mb-2"
                    />
                    <h4 className="font-semibold">{pro.name}</h4>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span>{pro.rating}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rate:</span>
                      <span className="font-medium">€{pro.hourlyRate}/hr</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Distance:</span>
                      <span>{pro.distance}km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Response:</span>
                      <span>{pro.responseTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Completion:</span>
                      <span>{pro.completionRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Verified:</span>
                      <span>{pro.verified ? '✓' : '✗'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Insured:</span>
                      <span>{pro.insured ? '✓' : '✗'}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm">Languages:</h5>
                    <div className="flex flex-wrap gap-1">
                      {pro.languages.map(lang => (
                        <Badge key={lang} variant="outline" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => toggleComparison(pro.id)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Compare Professionals
          </h1>
          <p className="text-muted-foreground">
            Find and compare the best professionals for your project
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'map' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('map')}
          >
            <Map className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearFilters}
              >
                Clear All
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setFiltersExpanded(!filtersExpanded)}
              >
                {filtersExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {filtersExpanded && (
            <>
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Hourly Rate: €{priceRange[0]} - €{priceRange[1]}
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={200}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>
              
              {/* Rating & Distance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Minimum Rating: {minRating > 0 ? minRating : 'Any'}
                  </label>
                  <Slider
                    value={[minRating]}
                    onValueChange={([value]) => setMinRating(value)}
                    max={5}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Max Distance: {maxDistance}km
                  </label>
                  <Slider
                    value={[maxDistance]}
                    onValueChange={([value]) => setMaxDistance(value)}
                    max={100}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
              
              {/* Checkboxes */}
              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="verified" 
                    checked={requireVerified}
                    onCheckedChange={(checked) => setRequireVerified(checked === true)}
                  />
                  <label htmlFor="verified" className="text-sm font-medium">
                    Verified Only
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="insured" 
                    checked={requireInsured}
                    onCheckedChange={(checked) => setRequireInsured(checked === true)}
                  />
                  <label htmlFor="insured" className="text-sm font-medium">
                    Insured Only
                  </label>
                </div>
              </div>
              
              {/* Languages */}
              <div>
                <label className="block text-sm font-medium mb-2">Languages</label>
                <div className="flex flex-wrap gap-2">
                  {languages.map((lang) => (
                    <Button
                      key={lang}
                      size="sm"
                      variant={selectedLanguages.includes(lang) ? "default" : "outline"}
                      onClick={() => {
                        setSelectedLanguages(prev =>
                          prev.includes(lang)
                            ? prev.filter(l => l !== lang)
                            : [...prev, lang]
                        );
                      }}
                    >
                      {lang}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          {filteredPros.length} professionals found
        </p>
        {selectedPros.length > 0 && (
          <Button 
            onClick={() => setShowComparison(true)}
            className="bg-primary text-primary-foreground"
          >
            <GitCompare className="w-4 h-4 mr-2" />
            Compare ({selectedPros.length})
          </Button>
        )}
      </div>

      {/* Professionals List */}
      {viewMode === 'list' ? (
        <div className="space-y-4">
          {filteredPros.map(renderProfessionalCard)}
        </div>
      ) : (
        <Card className="h-96">
          <CardContent className="p-6 flex items-center justify-center">
            <div className="text-center">
              <Map className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Map view coming soon</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparison Panel */}
      {selectedPros.length > 0 && renderComparison()}
    </div>
  );
};

export default EnhancedComparePros;