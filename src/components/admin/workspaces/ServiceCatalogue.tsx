import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp, 
  Star, 
  DollarSign,
  Users,
  Clock,
  Package,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ServiceCatalogueItem {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  base_price: number;
  avg_completion_time: number;
  popularity_score: number;
  total_bookings: number;
  avg_rating: number;
  active_professionals: number;
  status: 'active' | 'inactive' | 'deprecated';
  created_at: string;
  updated_at: string;
}

interface CatalogueStats {
  total_services: number;
  active_services: number;
  total_bookings: number;
  avg_rating: number;
  total_revenue: number;
  top_category: string;
}

export const ServiceCatalogue = () => {
  const [services, setServices] = useState<ServiceCatalogueItem[]>([]);
  const [stats, setStats] = useState<CatalogueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadServices();
    loadStats();
  }, []);

  const loadServices = async () => {
    try {
      // Mock service data - in real implementation, this would come from database
      const mockServices: ServiceCatalogueItem[] = [
        {
          id: '1',
          name: 'Emergency Plumbing Repair',
          category: 'Plumbing',
          subcategory: 'Emergency Services',
          description: 'Urgent plumbing repairs for leaks, clogs, and pipe failures',
          base_price: 125,
          avg_completion_time: 120,
          popularity_score: 89,
          total_bookings: 1247,
          avg_rating: 4.7,
          active_professionals: 34,
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          name: 'Electrical Panel Upgrade',
          category: 'Electrical',
          subcategory: 'Installations',
          description: 'Complete electrical panel replacement and upgrade services',
          base_price: 850,
          avg_completion_time: 480,
          popularity_score: 76,
          total_bookings: 189,
          avg_rating: 4.9,
          active_professionals: 12,
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-14T15:20:00Z'
        },
        {
          id: '3',
          name: 'Kitchen Cabinet Installation',
          category: 'Carpentry',
          subcategory: 'Kitchen Remodeling',
          description: 'Professional kitchen cabinet installation and fitting',
          base_price: 1200,
          avg_completion_time: 720,
          popularity_score: 82,
          total_bookings: 298,
          avg_rating: 4.6,
          active_professionals: 18,
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-13T09:45:00Z'
        },
        {
          id: '4',
          name: 'HVAC System Maintenance',
          category: 'HVAC',
          subcategory: 'Maintenance',
          description: 'Regular HVAC system cleaning and maintenance service',
          base_price: 180,
          avg_completion_time: 180,
          popularity_score: 67,
          total_bookings: 456,
          avg_rating: 4.4,
          active_professionals: 22,
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-12T11:30:00Z'
        },
        {
          id: '5',
          name: 'Basic House Cleaning',
          category: 'Cleaning',
          subcategory: 'Regular Cleaning',
          description: 'Standard house cleaning service for residential properties',
          base_price: 85,
          avg_completion_time: 120,
          popularity_score: 94,
          total_bookings: 2156,
          avg_rating: 4.3,
          active_professionals: 67,
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-15T16:15:00Z'
        }
      ];

      setServices(mockServices);
      setLoading(false);
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Failed to load service data');
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Mock stats data
      const mockStats: CatalogueStats = {
        total_services: 147,
        active_services: 132,
        total_bookings: 18947,
        avg_rating: 4.6,
        total_revenue: 2456780,
        top_category: 'Cleaning'
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'deprecated':
        return <Badge variant="destructive">Deprecated</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const categories = [...new Set(services.map(service => service.category))];
  
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.subcategory.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center">Loading Service Catalogue...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Service Catalogue</h2>
          <p className="text-muted-foreground">Manage service offerings and pricing</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Service Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Services</p>
                  <p className="text-2xl font-bold">{stats.total_services}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">{stats.active_services}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                  <p className="text-2xl font-bold">{(stats.total_bookings / 1000).toFixed(1)}k</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Rating</p>
                  <p className="text-2xl font-bold">{stats.avg_rating}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">${(stats.total_revenue / 1000000).toFixed(1)}M</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Top Category</p>
                  <p className="text-2xl font-bold">{stats.top_category}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">All Services</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-4">
            {filteredServices.map((service) => (
              <Card key={service.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">{service.name}</h3>
                        {getStatusBadge(service.status)}
                      </div>
                      <p className="text-muted-foreground mb-2">{service.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{service.category} • {service.subcategory}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Base Price</p>
                      <p className="font-bold text-lg">${service.base_price}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Time</p>
                      <p className="font-medium">{Math.floor(service.avg_completion_time / 60)}h {service.avg_completion_time % 60}m</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Popularity</p>
                      <div className="flex items-center space-x-2">
                        <Progress value={service.popularity_score} className="flex-1" />
                        <span className="text-sm font-medium">{service.popularity_score}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Bookings</p>
                      <p className="font-medium">{service.total_bookings}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rating</p>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium">{service.avg_rating}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Professionals</p>
                      <p className="font-medium">{service.active_professionals}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {categories.map(category => {
                  const categoryServices = services.filter(s => s.category === category);
                  const totalBookings = categoryServices.reduce((acc, s) => acc + s.total_bookings, 0);
                  const avgRating = categoryServices.reduce((acc, s) => acc + s.avg_rating, 0) / categoryServices.length;
                  
                  return (
                    <Card key={category}>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{category}</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Services:</span>
                            <span className="font-medium">{categoryServices.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Bookings:</span>
                            <span className="font-medium">{totalBookings}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Avg Rating:</span>
                            <span className="font-medium">{avgRating.toFixed(1)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Service pricing analytics and recommendations will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Service performance metrics and trends will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};