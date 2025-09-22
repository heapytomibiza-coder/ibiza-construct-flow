import { useState } from 'react';
import { useProfessionals } from '@/hooks/useProfessionals';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProfessionalCard from '@/components/professionals/ProfessionalCard';
import { 
  Users,
  Shield,
  Star,
  Clock,
  Search,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Professionals() {
  const { professionals, loading } = useProfessionals();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');

  // Get all unique specializations
  const allSpecializations = Array.from(
    new Set(
      professionals.flatMap(p => {
        const specs = p.specializations;
        return Array.isArray(specs) ? specs : [];
      })
    )
  ).sort();

  // Filter professionals based on search and filters
  const filteredProfessionals = professionals.filter(professional => {
    const specs = professional.specializations;
    
    const matchesSearch = !searchTerm || 
      professional.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professional.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (Array.isArray(specs) && specs.some(spec => 
        spec.toLowerCase().includes(searchTerm.toLowerCase())
      ));

    const matchesSpecialization = specializationFilter === 'all' ||
      (Array.isArray(specs) && specs.includes(specializationFilter));

    const matchesAvailability = availabilityFilter === 'all' ||
      professional.availability_status === availabilityFilter;

    return matchesSearch && matchesSpecialization && matchesAvailability;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Find <span className="text-primary">Trusted Professionals</span> Near You
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Connect with verified local experts for all your service needs. 
                Quality work, competitive prices, and reliable service guaranteed.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Overview */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mx-auto mb-3">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-bold">{professionals.length}</div>
                <div className="text-sm text-muted-foreground">Verified Professionals</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-3">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold">{professionals.reduce((sum, p) => sum + (p.total_jobs_completed || 0), 0)}</div>
                <div className="text-sm text-muted-foreground">Completed Projects</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mx-auto mb-3">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="text-2xl font-bold">
                  {professionals.length > 0 
                    ? (professionals.reduce((sum, p) => sum + (p.rating || 0), 0) / professionals.length).toFixed(1)
                    : '4.8'
                  }
                </div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm text-muted-foreground">SafePay Protection</div>
              </div>
            </div>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="py-8 bg-muted/50">
          <div className="container mx-auto px-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Find the Right Professional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      placeholder="Search by name, skills, or services..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  
                  <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Specializations</SelectItem>
                      {allSpecializations.map((spec) => (
                        <SelectItem key={spec} value={spec}>
                          {spec.charAt(0).toUpperCase() + spec.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Availability</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="busy">Busy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Professionals Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">Available Professionals</h2>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Filter className="w-4 h-4" />
                <span>{filteredProfessionals.length} professionals found</span>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredProfessionals.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No professionals found matching your criteria.</p>
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setSpecializationFilter('all');
                    setAvailabilityFilter('all');
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredProfessionals.map((professional) => (
                  <ProfessionalCard key={professional.id} professional={professional} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}